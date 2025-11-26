#!/bin/bash

################################################################################
# Fix Server PATH Script
#
# Fixes missing /bin and /usr/bin in PATH on production server
# Upload to server and run: bash fix-server-path.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Astralis Server PATH Fix ===${NC}"
echo ""

# Standard PATH
STANDARD_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

echo -e "${YELLOW}Current PATH:${NC}"
echo "$PATH"
echo ""

# 1. Fix /etc/environment (system-wide)
echo -e "${YELLOW}[1/5] Fixing /etc/environment...${NC}"
if [ -f /etc/environment ]; then
    cp /etc/environment /etc/environment.backup
fi
echo "PATH=\"$STANDARD_PATH\"" > /etc/environment
echo -e "${GREEN}✓ /etc/environment updated${NC}"

# 2. Fix root's .bashrc
echo -e "${YELLOW}[2/5] Fixing ~/.bashrc...${NC}"
if ! grep -q "PATH.*usr/bin" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Fixed PATH - added by fix-server-path.sh" >> ~/.bashrc
    echo "export PATH=\"$STANDARD_PATH:\$PATH\"" >> ~/.bashrc
    echo -e "${GREEN}✓ ~/.bashrc updated${NC}"
else
    echo -e "${GREEN}✓ ~/.bashrc already has PATH${NC}"
fi

# 3. Fix root's .profile
echo -e "${YELLOW}[3/5] Fixing ~/.profile...${NC}"
if ! grep -q "PATH.*usr/bin" ~/.profile 2>/dev/null; then
    echo "" >> ~/.profile
    echo "# Fixed PATH - added by fix-server-path.sh" >> ~/.profile
    echo "export PATH=\"$STANDARD_PATH:\$PATH\"" >> ~/.profile
    echo -e "${GREEN}✓ ~/.profile updated${NC}"
else
    echo -e "${GREEN}✓ ~/.profile already has PATH${NC}"
fi

# 4. Fix PM2 systemd service (if exists)
echo -e "${YELLOW}[4/5] Checking PM2 systemd service...${NC}"
PM2_SERVICE="/etc/systemd/system/pm2-root.service"
if [ -f "$PM2_SERVICE" ]; then
    if ! grep -q "Environment.*PATH" "$PM2_SERVICE"; then
        # Create override directory
        mkdir -p /etc/systemd/system/pm2-root.service.d/
        cat > /etc/systemd/system/pm2-root.service.d/path-fix.conf << EOF
[Service]
Environment="PATH=$STANDARD_PATH"
EOF
        systemctl daemon-reload
        echo -e "${GREEN}✓ PM2 service PATH override created${NC}"
    else
        echo -e "${GREEN}✓ PM2 service already has PATH${NC}"
    fi
else
    echo -e "${YELLOW}⚠ PM2 service not found (may be using different name)${NC}"
fi

# 5. Apply PATH immediately
echo -e "${YELLOW}[5/5] Applying PATH immediately...${NC}"
export PATH="$STANDARD_PATH:$PATH"
echo -e "${GREEN}✓ PATH applied to current session${NC}"

echo ""
echo -e "${GREEN}=== Fix Complete ===${NC}"
echo ""
echo -e "${YELLOW}New PATH:${NC}"
echo "$PATH"
echo ""

# Verify critical commands work
echo -e "${YELLOW}Verifying commands:${NC}"
for cmd in ls cat node npm pm2 git; do
    if command -v $cmd &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $cmd: $(command -v $cmd)"
    else
        echo -e "  ${RED}✗${NC} $cmd: not found"
    fi
done

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Log out and log back in, OR run: source ~/.bashrc"
echo "2. Restart PM2: pm2 restart all"
echo "3. Test your application"
echo ""
