import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { FiMail } from 'react-icons/fi';
import DraggableCanvasBlock from './DraggableCanvasBlock';

const Canvas = ({ blocks, setBlocks, selectedBlock, setSelectedBlock }) => {
  const addBlock = (type) => {
    const newBlock = {
      id: uuidv4(),
      type,
      content: getDefaultContent(type),
      src: type === 'image' ? 'https://via.placeholder.com/600x200' : '',
      url: type === 'button' ? '#' : '',
      styles: {
        color: type === 'button' ? '#ffffff' : '#000000',
        backgroundColor: type === 'button' ? '#0ea5e9' : 'transparent',
        fontSize: '16px',
        textAlign: 'center'
      },
      childButton: null
    };
    setBlocks([...blocks, newBlock]);
  };

  // Add a child button to a parent block (image or text)
  const addChildButton = (parentId) => {
    setBlocks(blocks.map(block => {
      if (block.id === parentId && (block.type === 'image' || block.type === 'text')) {
        return {
          ...block,
          childButton: {
            id: uuidv4(),
            content: 'Click Me',
            url: '#',
            styles: {
              color: '#ffffff',
              backgroundColor: '#0ea5e9',
              fontSize: '16px'
            }
          }
        };
      }
      return block;
    }));
  };

  // Remove child button from a parent block
  const removeChildButton = (parentId) => {
    setBlocks(blocks.map(block => {
      if (block.id === parentId) {
        return { ...block, childButton: null };
      }
      return block;
    }));
  };

  // Update block content (for inline editing)
  const updateBlockContent = (blockId, newContent) => {
    setBlocks(prevBlocks => prevBlocks.map(block => {
      if (block.id === blockId) {
        return { ...block, content: newContent };
      }
      return block;
    }));
  };

  // Expose function globally for inline editing
  window.updateBlockContent = updateBlockContent;

  const [{ isOver }, drop] = useDrop({
    accept: 'BLOCK',
    drop: (item) => {
      addBlock(item.type);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  const getDefaultContent = (type) => {
    switch (type) {
      case 'text': return ''; // Empty so placeholder shows
      case 'button': return 'Click Me';
      case 'divider': return '';
      default: return '';
    }
  };

  const moveBlock = (dragIndex, hoverIndex) => {
    const dragBlock = blocks[dragIndex];
    const newBlocks = [...blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, dragBlock);
    setBlocks(newBlocks);
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[600px] shadow-sm">
      <div
        ref={drop}
        className={`
          bg-gray-50 rounded-xl border-2 border-dashed min-h-[500px] p-5 transition-all
          ${isOver ? 'border-primary-500 bg-primary-50/50 shadow-inner' : 'border-gray-300'}
        `}
      >
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[450px] text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center mb-5">
              <FiMail className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Building Your Template
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Drag and drop blocks from the left panel to create your email template
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span>Drag & Drop Ready</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <DraggableCanvasBlock
                key={block.id}
                block={block}
                index={index}
                moveBlock={moveBlock}
                deleteBlock={deleteBlock}
                isSelected={selectedBlock?.id === block.id}
                onClick={() => setSelectedBlock(block)}
                onAddChildButton={addChildButton}
                onRemoveChildButton={removeChildButton}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
