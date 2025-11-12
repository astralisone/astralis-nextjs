// User Journey Mapping for Revenue Operations Authority
// Based on conversion-focused redesign with SolidROICalculator integration

export interface UserJourney {
  persona: string;
  description: string;
  painPoints: string[];
  goalState: string;
  journeyStages: JourneyStage[];
  conversionTriggers: string[];
  keyMetrics: string[];
}

export interface JourneyStage {
  stage: string;
  touchpoint: string;
  userActions: string[];
  emotions: string[];
  barriers: string[];
  opportunities: string[];
}

export const userJourneys: UserJourney[] = [
  {
    persona: "SaaS Revenue Leader",
    description: "VP/Director of Revenue Operations at $2M-$50M ARR SaaS company struggling with manual processes and disconnected tools",
    painPoints: [
      "Revenue team spending 40% of time on manual data entry",
      "Lead routing delays causing 30% conversion loss",
      "Disconnected sales and marketing tools creating attribution gaps",
      "Quarterly reporting taking 2+ weeks to compile",
      "Customer churn analysis happening too late to prevent losses"
    ],
    goalState: "Automated revenue operations with 90% process efficiency, real-time analytics, and predictive insights driving 25% revenue growth",
    journeyStages: [
      {
        stage: "Problem Recognition",
        touchpoint: "Google search: 'revenue operations automation SaaS'",
        userActions: [
          "Searches for RevOps solutions",
          "Compares automation platforms",
          "Reads case studies and ROI reports"
        ],
        emotions: ["Frustrated", "Overwhelmed", "Skeptical"],
        barriers: [
          "Too many generic solutions",
          "Unclear ROI calculations",
          "Integration complexity concerns"
        ],
        opportunities: [
          "Interactive ROI calculator showing specific SaaS metrics",
          "Industry-specific case studies",
          "Clear integration roadmap"
        ]
      },
      {
        stage: "Solution Evaluation",
        touchpoint: "Homepage - SolidROICalculator interaction",
        userActions: [
          "Adjusts team size (15-50 employees)",
          "Selects SaaS industry vertical",
          "Reviews calculated metrics: $25K+ monthly savings, 180% ROI",
          "Downloads detailed ROI report"
        ],
        emotions: ["Interested", "Cautious", "Hopeful"],
        barriers: [
          "Budget approval processes",
          "Implementation timeline concerns",
          "Change management resistance"
        ],
        opportunities: [
          "Immediate value demonstration",
          "Implementation timeline clarity",
          "Success story testimonials"
        ]
      },
      {
        stage: "Vendor Selection",
        touchpoint: "Free Revenue Audit booking",
        userActions: [
          "Books audit call",
          "Shares current tech stack",
          "Discusses specific pain points",
          "Reviews custom ROI projection"
        ],
        emotions: ["Confident", "Engaged", "Decisive"],
        barriers: [
          "Internal stakeholder alignment",
          "Contract negotiation complexity",
          "Onboarding resource allocation"
        ],
        opportunities: [
          "Stakeholder presentation materials",
          "Flexible engagement models",
          "Dedicated implementation support"
        ]
      }
    ],
    conversionTriggers: [
      "Seeing $25K+ monthly savings projection",
      "180% ROI calculation with 3.2 month payback",
      "SaaS-specific workflow demonstrations",
      "Limited audit availability urgency"
    ],
    keyMetrics: [
      "Hours saved per month: 340+",
      "Monthly cost reduction: $25,000+",
      "ROI percentage: 180%+",
      "Payback period: 3.2 months"
    ]
  },
  
  {
    persona: "E-commerce Growth Director",
    description: "Growth/Operations leader at $10M+ GMV e-commerce company needing automated customer lifecycle management",
    painPoints: [
      "Manual customer segmentation taking weeks",
      "Abandoned cart recovery operating at 12% effectiveness",
      "Inventory forecasting causing stockouts and overstock",
      "Customer lifetime value calculations outdated",
      "Multi-channel attribution completely broken"
    ],
    goalState: "Real-time customer intelligence driving 40% higher retention, automated lifecycle marketing, and precise inventory optimization",
    journeyStages: [
      {
        stage: "Problem Recognition",
        touchpoint: "LinkedIn post about e-commerce automation",
        userActions: [
          "Engages with RevOps content",
          "Researches e-commerce automation solutions",
          "Evaluates current customer data gaps"
        ],
        emotions: ["Concerned", "Analytical", "Time-pressured"],
        barriers: [
          "Platform integration complexity",
          "Customer data privacy concerns",
          "Seasonal business fluctuations"
        ],
        opportunities: [
          "E-commerce specific ROI calculations",
          "Multi-platform integration showcase",
          "Seasonal optimization case studies"
        ]
      },
      {
        stage: "Solution Evaluation",
        touchpoint: "ROI Calculator - E-commerce selection",
        userActions: [
          "Inputs team size (25-100 employees)",
          "Selects e-commerce industry",
          "Reviews metrics: $32K monthly savings, 220% ROI",
          "Explores workflow automation demos"
        ],
        emotions: ["Intrigued", "Calculating", "Optimistic"],
        barriers: [
          "Peak season implementation timing",
          "Customer experience disruption risks",
          "Technical team bandwidth"
        ],
        opportunities: [
          "Phased implementation approach",
          "Customer experience enhancement focus",
          "Technical team collaboration"
        ]
      },
      {
        stage: "Vendor Selection",
        touchpoint: "Revenue audit with GMV projections",
        userActions: [
          "Reviews GMV impact analysis",
          "Discusses customer lifecycle automation",
          "Evaluates inventory optimization ROI",
          "Plans implementation timeline"
        ],
        emotions: ["Excited", "Strategic", "Ready"],
        barriers: [
          "Executive team buy-in",
          "Budget allocation timing",
          "Vendor contract terms"
        ],
        opportunities: [
          "Executive summary with GMV projections",
          "Flexible payment terms",
          "Success guarantee options"
        ]
      }
    ],
    conversionTriggers: [
      "32K+ monthly savings for e-commerce operations",
      "220% ROI with inventory optimization",
      "Customer lifetime value improvement demonstrations",
      "Limited audit slots availability"
    ],
    keyMetrics: [
      "Hours saved per month: 280+",
      "Monthly cost reduction: $32,000+",
      "ROI percentage: 220%+",
      "Payback period: 2.8 months"
    ]
  },

  {
    persona: "Professional Services Partner",
    description: "Managing Partner at $5M+ revenue consulting/services firm needing client operations automation and project profitability optimization",
    painPoints: [
      "Project profitability analysis happening post-completion",
      "Client communication scattered across multiple platforms",
      "Resource allocation decisions based on outdated data",
      "Invoice collection averaging 45+ days",
      "Proposal creation taking 8+ hours per opportunity"
    ],
    goalState: "Real-time project profitability tracking, automated client workflows, and predictive resource optimization increasing margins by 35%",
    journeyStages: [
      {
        stage: "Problem Recognition",
        touchpoint: "Industry conference or peer referral",
        userActions: [
          "Discusses operational challenges with peers",
          "Researches professional services automation",
          "Evaluates current project management gaps"
        ],
        emotions: ["Frustrated", "Competitive", "Solution-focused"],
        barriers: [
          "Client relationship disruption concerns",
          "Partner consensus requirements",
          "Implementation during billable hours"
        ],
        opportunities: [
          "Professional services specific ROI modeling",
          "Client relationship enhancement focus",
          "Partner-level testimonials"
        ]
      },
      {
        stage: "Solution Evaluation",
        touchpoint: "Professional Services ROI calculation",
        userActions: [
          "Inputs firm size (10-75 employees)",
          "Reviews professional services metrics",
          "Calculates potential margin improvements: $28K+ monthly",
          "Explores client workflow automation"
        ],
        emotions: ["Intrigued", "Analytical", "Cautious"],
        barriers: [
          "Client data security requirements",
          "Billable hour impact during implementation",
          "Partner equity considerations"
        ],
        opportunities: [
          "Security compliance demonstration",
          "Phased rollout minimizing disruption",
          "Partner-specific ROI breakdown"
        ]
      },
      {
        stage: "Vendor Selection",
        touchpoint: "Partner-level revenue audit",
        userActions: [
          "Conducts firm-wide operational assessment",
          "Reviews client portfolio optimization",
          "Evaluates project profitability improvements",
          "Discusses partner consensus requirements"
        ],
        emotions: ["Confident", "Strategic", "Partnership-focused"],
        barriers: [
          "Partner unanimous approval",
          "Client communication about changes",
          "Implementation timeline coordination"
        ],
        opportunities: [
          "Partner presentation materials",
          "Client communication templates",
          "Success metric tracking dashboard"
        ]
      }
    ],
    conversionTriggers: [
      "28K+ monthly margin improvement calculations",
      "300% ROI on professional services optimization",
      "Project profitability tracking demonstrations",
      "Partner-level success testimonials"
    ],
    keyMetrics: [
      "Hours saved per month: 450+",
      "Monthly margin improvement: $28,000+",
      "ROI percentage: 300%+",
      "Payback period: 2.1 months"
    ]
  },

  {
    persona: "General Business Operations Manager",
    description: "Operations Manager at established business ($2M+ revenue) across various industries needing process optimization and data-driven decision making",
    painPoints: [
      "Manual reporting consuming 25% of team capacity",
      "Disconnected systems creating data silos",
      "Process bottlenecks difficult to identify and resolve",
      "Customer insights scattered and incomplete",
      "Growth initiatives lacking operational foundation"
    ],
    goalState: "Integrated operations platform providing real-time insights, automated processes, and scalable foundation supporting 50%+ growth",
    journeyStages: [
      {
        stage: "Problem Recognition",
        touchpoint: "Business operations content or search results",
        userActions: [
          "Researches business process automation",
          "Evaluates operational efficiency solutions",
          "Compares platform integration options"
        ],
        emotions: ["Overwhelmed", "Determined", "Resource-conscious"],
        barriers: [
          "Budget constraints and approval processes",
          "Technical complexity concerns",
          "Change management across departments"
        ],
        opportunities: [
          "Industry-agnostic ROI calculations",
          "Scalable implementation approach",
          "Cross-industry success stories"
        ]
      },
      {
        stage: "Solution Evaluation",
        touchpoint: "General industry ROI calculator",
        userActions: [
          "Tests various team sizes (5-200 employees)",
          "Reviews general business metrics",
          "Calculates operational improvements: $18K+ monthly",
          "Downloads operational assessment report"
        ],
        emotions: ["Hopeful", "Practical", "Budget-conscious"],
        barriers: [
          "Executive approval for operational changes",
          "Department coordination requirements",
          "Implementation resource availability"
        ],
        opportunities: [
          "Executive business case materials",
          "Departmental coordination support",
          "Flexible implementation timeline"
        ]
      },
      {
        stage: "Vendor Selection",
        touchpoint: "Business operations audit",
        userActions: [
          "Reviews comprehensive operational assessment",
          "Discusses departmental integration approach",
          "Evaluates scalability for future growth",
          "Plans change management strategy"
        ],
        emotions: ["Confident", "Systematic", "Growth-focused"],
        barriers: [
          "Multi-stakeholder approval process",
          "Budget allocation timing",
          "Implementation coordination complexity"
        ],
        opportunities: [
          "Stakeholder alignment workshops",
          "Flexible engagement options",
          "Success milestone tracking"
        ]
      }
    ],
    conversionTriggers: [
      "18K+ monthly operational savings",
      "140% ROI across general business operations",
      "Process automation demonstrations",
      "Scalable growth foundation messaging"
    ],
    keyMetrics: [
      "Hours saved per month: 240+",
      "Monthly operational savings: $18,000+",
      "ROI percentage: 140%+",
      "Payback period: 4.2 months"
    ]
  }
];

// Journey stage mapping for conversion optimization
export const conversionFunnelMapping = {
  awareness: "Problem Recognition",
  interest: "Solution Evaluation", 
  consideration: "Vendor Selection",
  action: "Engagement Decision"
};

// Critical conversion moments across all personas
export const universalConversionTriggers = [
  "Interactive ROI calculator engagement",
  "Industry-specific metric visualization",
  "Limited audit availability urgency",
  "Immediate value demonstration",
  "Success story social proof"
];