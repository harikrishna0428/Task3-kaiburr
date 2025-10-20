import React, { useState } from 'react';
import { Layout, Typography, Button, Space, message } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskExecutionView from './components/TaskExecutionView';
import { Task } from './types';

const { Header, Content } = Layout;
const { Title } = Typography;

type ViewMode = 'list' | 'create' | 'edit' | 'execute';

interface AppState {
  viewMode: ViewMode;
  selectedTask?: Task;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    viewMode: 'list',
  });

  const navigateTo = (viewMode: ViewMode, selectedTask?: Task) => {
    setState({ viewMode, selectedTask });
  };

  const handleCreateTask = () => {
    navigateTo('create');
  };

  const handleEditTask = (task: Task) => {
    navigateTo('edit', task);
  };

  const handleRunTask = (task: Task) => {
    navigateTo('execute', task);
  };

  const handleSaveTask = (task: Task) => {
    message.success('Task saved successfully');
    navigateTo('list');
  };

  const handleCancel = () => {
    navigateTo('list');
  };

  const renderContent = () => {
    switch (state.viewMode) {
      case 'create':
        return (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={handleCancel}
          />
        );
      case 'edit':
        return (
          <TaskForm
            task={state.selectedTask}
            onSave={handleSaveTask}
            onCancel={handleCancel}
          />
        );
      case 'execute':
        return (
          <TaskExecutionView
            task={state.selectedTask!}
            onClose={handleCancel}
          />
        );
      default:
        return (
          <TaskList
            onEditTask={handleEditTask}
            onCreateTask={handleCreateTask}
            onRunTask={handleRunTask}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (state.viewMode) {
      case 'create':
        return 'Create New Task';
      case 'edit':
        return 'Edit Task';
      case 'execute':
        return 'Task Execution';
      default:
        return 'Task Runner';
    }
  };

  const showBackButton = state.viewMode !== 'list';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {showBackButton && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              style={{ marginRight: 16 }}
              aria-label="Go back"
            >
              Back
            </Button>
          )}
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {getPageTitle()}
          </Title>
        </div>
        
        {state.viewMode === 'list' && (
          <Space>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => window.location.reload()}
              aria-label="Refresh application"
            >
              Refresh
            </Button>
          </Space>
        )}
      </Header>

      <Content style={{ 
        padding: '24px', 
        background: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </Content>
    </Layout>
  );
};

export default App;
