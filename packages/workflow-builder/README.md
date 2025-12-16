# @astralis/workflow-builder

A React component library for building visual drag-and-drop workflows compatible with n8n automation platform.

## Features

- 🎨 **Visual Workflow Builder**: Drag-and-drop interface for creating workflows
- 🔗 **n8n Integration**: Direct compatibility with n8n workflow engine
- 🎛️ **Node Palette**: Comprehensive library of workflow nodes
- ⚙️ **Property Panel**: Dynamic configuration for node parameters
- ✅ **Validation**: Real-time workflow validation and error checking
- 📱 **Responsive**: Works on desktop and tablet devices
- 🎨 **Customizable**: Easy theming and styling options

## Installation

```bash
npm install @astralis/workflow-builder
# or
yarn add @astralis/workflow-builder
```

## Peer Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## Quick Start

```tsx
import { WorkflowBuilder } from '@astralis/workflow-builder';

function MyWorkflowApp() {
  const [workflow, setWorkflow] = useState(null);

  // Fetch available n8n nodes
  const availableNodes = await fetch('/api/n8n/nodes').then(r => r.json());

  return (
    <div style={{ height: '600px' }}>
      <WorkflowBuilder
        availableNodes={availableNodes}
        onWorkflowChange={setWorkflow}
        onSave={async (workflow) => {
          await fetch('/api/workflows', {
            method: 'POST',
            body: JSON.stringify(workflow),
          });
        }}
      />
    </div>
  );
}
```

## API Reference

### WorkflowBuilder Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `availableNodes` | `N8nNodeDefinition[]` | ✅ | List of available n8n nodes |
| `initialWorkflow` | `WorkflowData` | ❌ | Initial workflow to load |
| `onWorkflowChange` | `(workflow: WorkflowData) => void` | ❌ | Called when workflow changes |
| `onValidate` | `(workflow: WorkflowData) => Promise<ValidationResult>` | ❌ | Custom validation function |
| `onSave` | `(workflow: WorkflowData) => Promise<void>` | ❌ | Save workflow callback |
| `onDeploy` | `(workflow: WorkflowData) => Promise<void>` | ❌ | Deploy workflow callback |
| `readOnly` | `boolean` | ❌ | Disable editing (default: false) |
| `className` | `string` | ❌ | Additional CSS classes |

### Workflow Data Types

```typescript
interface WorkflowData {
  id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings?: Record<string, any>;
}

interface N8nNodeDefinition {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  properties: N8nNodeProperty[];
}
```

## Component Architecture

```
WorkflowBuilder
├── NodePalette (Left Sidebar)
│   ├── Search & Filter
│   ├── Node Categories
│   └── Draggable Nodes
├── WorkflowCanvas (Main Area)
│   ├── React Flow Canvas
│   ├── Node Components
│   ├── Connection Lines
│   └── Zoom/Pan Controls
└── PropertyPanel (Right Sidebar)
    ├── Node Configuration
    ├── Validation Results
    └── Action Buttons
```

## Node Types

- **Trigger Nodes**: Webhooks, schedules, events
- **Action Nodes**: HTTP requests, data transformations
- **Logic Nodes**: Conditionals, loops, switches
- **Data Nodes**: Variables, data manipulation
- **Integration Nodes**: External service connections
- **Output Nodes**: Email, notifications, API responses

## Validation

The builder includes comprehensive validation:

- **Structural Validation**: Required connections and node relationships
- **Parameter Validation**: Required fields and data types
- **Logic Validation**: Workflow flow and potential issues
- **Real-time Feedback**: Immediate validation as you build

## Styling & Theming

The component uses Tailwind CSS classes and can be customized:

```tsx
<WorkflowBuilder
  className="custom-workflow-theme"
  // Override default styles
/>
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [astralis/workflow-builder](https://github.com/astralis/workflow-builder)
- Documentation: [docs.astralis.one](https://docs.astralis.one)