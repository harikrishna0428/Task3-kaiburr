import { Task, CreateTaskRequest } from './types';

const API_BASE_URL = 'http://localhost:8080/tasks';

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  }

  async getAllTasks(): Promise<Task[]> {
    const response = await fetch(API_BASE_URL);
    return this.handleResponse<Task[]>(response);
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}?id=${encodeURIComponent(id)}`);
    return this.handleResponse<Task>(response);
  }

  async searchTasksByName(name: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}?name=${encodeURIComponent(name)}`);
    return this.handleResponse<Task[]>(response);
  }

  async createOrUpdateTask(task: CreateTaskRequest): Promise<Task> {
    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return this.handleResponse<Task>(response);
  }

  async updateTask(id: string, task: CreateTaskRequest): Promise<Task> {
    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...task, id }),
    });
    return this.handleResponse<Task>(response);
  }

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  async runTask(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/${id}/run`, {
      method: 'PUT',
    });
    return this.handleResponse<Task>(response);
  }
}

export const apiService = new ApiService();
