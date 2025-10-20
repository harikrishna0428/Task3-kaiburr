import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Card, 
  Typography, 
  Popconfirm, 
  message, 
  Tag,
  Tooltip,
  Empty,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  PlayCircleOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Task } from '../types';
import { apiService } from '../api';

const { Title } = Typography;
const { Search } = Input;

interface TaskListProps {
  onEditTask: (task: Task) => void;
  onCreateTask: () => void;
  onRunTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onEditTask, onCreateTask, onRunTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllTasks();
      setTasks(data);
    } catch (error) {
      message.error(`Failed to load tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      loadTasks();
      return;
    }

    setSearchLoading(true);
    try {
      const data = await apiService.searchTasksByName(value);
      setTasks(data);
    } catch (error) {
      message.error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteTask(id);
      message.success('Task deleted successfully');
      loadTasks();
    } catch (error) {
      message.error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRunTask = async (task: Task) => {
    if (!task.id) return;
    
    try {
      const updatedTask = await apiService.runTask(task.id);
      message.success('Task executed successfully');
      onRunTask(updatedTask);
      loadTasks(); // Refresh the list to show updated execution history
    } catch (error) {
      message.error(`Failed to run task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Task, b: Task) => a.name.localeCompare(b.name),
      render: (text: string, record: Task) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      sorter: (a: Task, b: Task) => a.owner.localeCompare(b.owner),
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Command',
      dataIndex: 'command',
      key: 'command',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <code style={{ 
            background: '#f5f5f5', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            {text}
          </code>
        </Tooltip>
      ),
    },
    {
      title: 'Executions',
      dataIndex: 'taskExecutions',
      key: 'executions',
      width: 100,
      render: (executions: any[]) => (
        <Tag color={executions && executions.length > 0 ? 'green' : 'default'}>
          {executions ? executions.length : 0}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record: Task) => (
        <Space size="small">
          <Tooltip title="Run Task">
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunTask(record)}
              aria-label={`Run task ${record.name}`}
            />
          </Tooltip>
          <Tooltip title="Edit Task">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditTask(record)}
              aria-label={`Edit task ${record.name}`}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Task">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                aria-label={`Delete task ${record.name}`}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Task Management</Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateTask}
              aria-label="Create new task"
            >
              Create Task
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTasks}
              loading={loading}
              aria-label="Refresh tasks"
            >
              Refresh
            </Button>
          </Space>
        </div>
        
        <Search
          placeholder="Search tasks by name..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          loading={searchLoading}
          aria-label="Search tasks"
        />
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tasks`,
        }}
        locale={{
          emptyText: (
            <Empty
              description="No tasks found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={onCreateTask}>
                Create Your First Task
              </Button>
            </Empty>
          ),
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default TaskList;
