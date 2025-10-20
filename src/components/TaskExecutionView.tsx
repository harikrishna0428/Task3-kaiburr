import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Table, 
  Tag, 
  message, 
  Spin,
  Empty,
  Tooltip,
  Divider,
  Alert
} from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ReloadOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { Task, TaskExecution } from '../types';
import { apiService } from '../api';

const { Title, Text } = Typography;

interface TaskExecutionViewProps {
  task: Task;
  onClose: () => void;
}

const TaskExecutionView: React.FC<TaskExecutionViewProps> = ({ task, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState<TaskExecution[]>(task.taskExecutions || []);

  const handleRunTask = async () => {
    if (!task.id) return;
    
    setLoading(true);
    try {
      const updatedTask = await apiService.runTask(task.id);
      setExecutions(updatedTask.taskExecutions || []);
      message.success('Task executed successfully');
    } catch (error) {
      message.error(`Failed to run task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Output copied to clipboard');
    }).catch(() => {
      message.error('Failed to copy to clipboard');
    });
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
    
    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(2)}s`;
    } else {
      return `${(duration / 60000).toFixed(2)}m`;
    }
  };

  const getStatusColor = (output: string) => {
    if (output.toLowerCase().includes('error')) {
      return 'error';
    }
    return 'success';
  };

  const executionColumns = [
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {formatDateTime(text)}
        </div>
      ),
      sorter: (a: TaskExecution, b: TaskExecution) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record: TaskExecution) => (
        <Tag color="blue">
          {getDuration(record.startTime, record.endTime)}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record: TaskExecution) => (
        <Tag color={getStatusColor(record.output)} icon={<CheckCircleOutlined />}>
          {getStatusColor(record.output) === 'error' ? 'Error' : 'Success'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record: TaskExecution) => (
        <Tooltip title="Copy Output">
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(record.output)}
            aria-label="Copy output to clipboard"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Task Execution: {task.name}
            </Title>
            <Text type="secondary">
              Owner: {task.owner} | Command: <code>{task.command}</code>
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRunTask}
              loading={loading}
              aria-label="Run task"
            >
              Run Task
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </Space>
        </div>
      </div>

      <Alert
        message="Command Execution"
        description={`This will execute: ${task.command}`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Execution History</Title>
        <Text type="secondary">
          Total executions: {executions.length}
        </Text>
      </div>

      <Table
        columns={executionColumns}
        dataSource={executions}
        rowKey={(record, index) => `${record.startTime}-${index}`}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} executions`,
        }}
        expandable={{
          expandedRowRender: (record: TaskExecution) => (
            <div style={{ margin: 0 }}>
              <Divider orientation="left">Command Output</Divider>
              <div style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                {record.output || 'No output'}
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  End Time: {formatDateTime(record.endTime)}
                </Text>
              </div>
            </div>
          ),
          rowExpandable: () => true,
        }}
        locale={{
          emptyText: (
            <Empty
              description="No executions yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleRunTask} loading={loading}>
                Run Task Now
              </Button>
            </Empty>
          ),
        }}
      />
    </Card>
  );
};

export default TaskExecutionView;
