import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableCanvasBlock from '../DraggableCanvasBlock';

const renderWithDnd = (component) => {
  return render(
    <DndProvider backend={HTML5Backend}>
      {component}
    </DndProvider>
  );
};

describe('DraggableCanvasBlock', () => {
  const mockBlock = {
    id: '1',
    type: 'text',
    content: 'Test content',
    styles: {
      color: '#000000',
      fontSize: '16px',
      textAlign: 'left'
    }
  };

  it('should render text block', () => {
    renderWithDnd(
      <DraggableCanvasBlock
        block={mockBlock}
        index={0}
        moveBlock={() => {}}
        deleteBlock={() => {}}
        isSelected={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render button block', () => {
    const buttonBlock = {
      ...mockBlock,
      type: 'button',
      content: 'Click me',
      styles: {
        ...mockBlock.styles,
        backgroundColor: '#4CAF50'
      }
    };

    renderWithDnd(
      <DraggableCanvasBlock
        block={buttonBlock}
        index={0}
        moveBlock={() => {}}
        deleteBlock={() => {}}
        isSelected={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render image block', () => {
    const imageBlock = {
      ...mockBlock,
      type: 'image',
      src: 'https://example.com/image.jpg'
    };

    renderWithDnd(
      <DraggableCanvasBlock
        block={imageBlock}
        index={0}
        moveBlock={() => {}}
        deleteBlock={() => {}}
        isSelected={false}
        onClick={() => {}}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
});
