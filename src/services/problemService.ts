import api from './api';

export interface ProblemStatement {
  _id: string;
  id: string;
  title: string;
  abstract: string;
  technologies: string[];
  domain: string;
  category: 'Major' | 'Minor' | 'Capstone';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  deliverables: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  status: 'Active' | 'Draft' | 'Archived';
  featured: boolean;
  tags: string[];
  viewCount: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProblemData {
  title: string;
  abstract: string;
  technologies: string[];
  domain: string;
  category: 'Major' | 'Minor' | 'Capstone';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  deliverables: string[];
  prerequisites?: string[];
  learningOutcomes?: string[];
  tags?: string[];
}

export interface UpdateProblemData extends Partial<CreateProblemData> {
  status?: 'Active' | 'Draft' | 'Archived';
  featured?: boolean;
}

export interface ProblemFilters {
  domain?: string;
  difficulty?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProblemStats {
  overview: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    featured: number;
    totalViews: number;
  };
  domainDistribution: Array<{
    _id: string;
    count: number;
  }>;
  difficultyDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

// Problem Statement API calls
export const problemService = {
  // Get all problems with filters
  getProblems: async (filters: ProblemFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/problems?${params.toString()}`);
    return response.data;
  },

  // Get single problem by ID
  getProblem: async (id: string) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  // Get problem by custom ID (AIM001, etc.)
  getProblemByCustomId: async (customId: string) => {
    const response = await api.get(`/problems/custom/${customId}`);
    return response.data;
  },

  // Create new problem
  createProblem: async (data: CreateProblemData) => {
    const response = await api.post('/problems', data);
    return response.data;
  },

  // Update problem
  updateProblem: async (id: string, data: UpdateProblemData) => {
    const response = await api.put(`/problems/${id}`, data);
    return response.data;
  },

  // Delete problem
  deleteProblem: async (id: string) => {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },

  // Update problem status
  updateProblemStatus: async (id: string, status: 'Active' | 'Draft' | 'Archived') => {
    const response = await api.put(`/problems/${id}/status`, { status });
    return response.data;
  },

  // Toggle featured status
  toggleFeatured: async (id: string) => {
    const response = await api.put(`/problems/${id}/featured`);
    return response.data;
  },

  // Get featured problems
  getFeaturedProblems: async (limit = 6) => {
    const response = await api.get(`/problems/featured?limit=${limit}`);
    return response.data;
  },

  // Get popular problems
  getPopularProblems: async (limit = 10) => {
    const response = await api.get(`/problems/popular?limit=${limit}`);
    return response.data;
  },

  // Search problems
  searchProblems: async (query: string, filters: Omit<ProblemFilters, 'search'> = {}) => {
    const params = new URLSearchParams();
    params.append('q', query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/problems/search?${params.toString()}`);
    return response.data;
  },

  // Get problems by domain
  getProblemsByDomain: async (domain: string, page = 1, limit = 10) => {
    const response = await api.get(`/problems/domain/${domain}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get problem statistics
  getProblemStats: async (): Promise<{ success: boolean; data: ProblemStats }> => {
    const response = await api.get('/problems/stats');
    return response.data;
  },

  // Bulk upload problems (CSV)
  bulkUploadProblems: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/problems/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download CSV template
  downloadTemplate: async () => {
    const response = await api.get('/problems/template', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'problem-statements-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// Constants for form options
export const DOMAINS = [
  'AI & Machine Learning',
  'IoT & Embedded Systems',
  'Cloud Computing',
  'Web & Mobile Applications',
  'Cybersecurity & Blockchain',
  'Data Science & Analytics',
  'Networking & Communication',
  'Mechanical / ECE Projects'
];

export const CATEGORIES = ['Major', 'Minor', 'Capstone'] as const;

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

export const STATUSES = ['Active', 'Draft', 'Archived'] as const;

export const COMMON_TECHNOLOGIES = [
  'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'MySQL',
  'HTML', 'CSS', 'TypeScript', 'Java', 'C++', 'C#', 'PHP',
  'TensorFlow', 'PyTorch', 'Django', 'Flask', 'Express.js',
  'Angular', 'Vue.js', 'Android', 'iOS', 'Flutter', 'React Native',
  'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'REST API',
  'GraphQL', 'Firebase', 'Redis', 'PostgreSQL', 'SQLite'
];

export const COMMON_DELIVERABLES = [
  'Complete source code with documentation',
  'User interface with responsive design',
  'Database schema and API documentation',
  'Deployment guide and demo video',
  'Technical report and presentation',
  'Test cases and quality assurance',
  'User manual and installation guide',
  'Performance analysis and optimization',
  'Security implementation and testing',
  'Project documentation and README'
];

export const COMMON_PREREQUISITES = [
  'Strong programming skills',
  'Basic understanding of web development',
  'Knowledge of database design',
  'Experience with version control (Git)',
  'Understanding of software engineering principles',
  'Basic knowledge of algorithms and data structures',
  'Familiarity with development tools and IDEs',
  'Problem-solving and analytical thinking',
  'Good communication and documentation skills',
  'Ability to work in a team environment'
];

export const COMMON_LEARNING_OUTCOMES = [
  'Implement full-stack web applications',
  'Apply software engineering best practices',
  'Work with modern development frameworks',
  'Design and develop user-friendly interfaces',
  'Integrate third-party APIs and services',
  'Implement security best practices',
  'Perform testing and quality assurance',
  'Deploy applications to cloud platforms',
  'Collaborate effectively in development teams',
  'Document and present technical solutions'
];
