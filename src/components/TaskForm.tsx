import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  message,
  Select,
  Alert
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { Task, CreateTaskRequest } from '../types';
import { apiService } from '../api';

const { Title } = Typography;
const { TextArea } = Input;

interface TaskFormProps {
  task?: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const ALLOWED_COMMANDS = [
  'echo',
  'date', 
  'time',
  'whoami',
  'hostname',
  'pwd',
  'ls',
  'dir'
];

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<string>('');

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        name: task.name,
        owner: task.owner,
        command: task.command,
      });
      setSelectedCommand(task.command.split(' ')[0]);
    }
  }, [task, form]);

  const handleSubmit = async (values: CreateTaskRequest) => {
    setLoading(true);
    try {
      const savedTask = await apiService.createOrUpdateTask(values);
      message.success(task ? 'Task updated successfully' : 'Task created successfully');
      onSave(savedTask);
    } catch (error) {
      message.error(`Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCommandChange = (value: string) => {
    setSelectedCommand(value);
    form.setFieldsValue({ command: value });
  };

  const handleCustomCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const command = e.target.value;
    const baseCommand = command.split(' ')[0];
    setSelectedCommand(baseCommand);
  };

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          {task ? 'Edit Task' : 'Create New Task'}
        </Title>
      </div>

      <Alert
        message="Security Notice"
        description="Only safe commands are allowed. Dangerous operations like file deletion, system shutdown, or network requests are blocked for security."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        aria-label={task ? 'Edit task form' : 'Create task form'}
      >
        <Form.Item
          label="Task Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter a task name' },
            { min: 2, message: 'Task name must be at least 2 characters' },
            { max: 100, message: 'Task name must not exceed 100 characters' }
          ]}
        >
          <Input 
            placeholder="Enter task name"
            aria-label="Task name"
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Owner"
          name="owner"
          rules={[
            { required: true, message: 'Please enter an owner' },
            { min: 2, message: 'Owner must be at least 2 characters' },
            { max: 50, message: 'Owner must not exceed 50 characters' }
          ]}
        >
          <Input 
            placeholder="Enter owner name"
            aria-label="Task owner"
            maxLength={50}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Command"
          name="command"
          rules={[
            { required: true, message: 'Please enter a command' },
            { min: 2, message: 'Command must be at least 2 characters' },
            { max: 200, message: 'Command must not exceed 200 characters' }
          ]}
        >
          <div>
            <Select
              placeholder="Select a command"
              style={{ width: '100%', marginBottom: 8 }}
              value={selectedCommand}
              onChange={handleCommandChange}
              aria-label="Select command"
            >
              {ALLOWED_COMMANDS.map(cmd => (
                <Select.Option key={cmd} value={cmd}>
                  {cmd}
                </Select.Option>
              ))}
            </Select>
            <Input
              placeholder="Or enter a custom command"
              onChange={handleCustomCommandChange}
              aria-label="Custom command"
              maxLength={200}
              showCount
            />
          </div>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              aria-label="Save task"
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
            <Button
              onClick={onCancel}
              icon={<CloseOutlined />}
              aria-label="Cancel"
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TaskForm;
