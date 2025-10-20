export interface TaskExecution {
  startTime: string;
  endTime: string;
  output: string;
}

export interface Task {
  id?: string;
  name: string;
  owner: string;
  command: string;
  taskExecutions?: TaskExecution[];
}

export interface CreateTaskRequest {
  name: string;
  owner: string;
  command: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
