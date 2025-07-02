export interface ProjectInput {
  name: string;
  description: string;
  goals: string[];
  constraints: string[];
  preferences: {
    projectType: string;
    experienceLevel: string;
    timeline?: string;
    budget?: string;
  };
}

export interface ProjectRequirements {
  problemStatement: string;
  targetAudience: string;
  keyFeatures: string[];
  successMetrics: string[];
  outOfScope: string[];
}

export interface ProjectArchitecture {
  overview: string;
  techStack: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    infrastructure?: string[];
  };
  components: Array<{
    name: string;
    purpose: string;
    technologies: string[];
  }>;
  dataFlow: string;
  securityConsiderations: string[];
}

export interface ProjectPlan {
  phases: Array<{
    name: string;
    duration: string;
    goals: string[];
    tasks: Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      estimatedHours: number;
      dependencies?: string[];
    }>;
  }>;
  milestones: Array<{
    name: string;
    deliverables: string[];
  }>;
  risks: Array<{
    description: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
}

export interface AIProvider {
  name: 'claude' | 'gpt4' | 'gemini';
  analyze(input: ProjectInput, previousAnalysis?: any): Promise<any>;
}

export interface ProjectAnalysis {
  requirements: ProjectRequirements;
  architecture: ProjectArchitecture;
  plan: ProjectPlan;
  metadata: {
    analyzedAt: string;
    providers: string[];
    totalTokensUsed?: number;
    estimatedCost?: number;
  };
}