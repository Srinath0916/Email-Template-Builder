import React from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { FiMail } from 'react-icons/fi';
import DraggableCanvasBlock from './DraggableCanvasBlock';

const Canvas = ({ blocks, setBlocks, selectedBlock, setSelectedBlock }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BLOCK',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        addBlock(item.type);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }));

  const addBlock = (type) => {
    const newBlock = {
      id: uuidv4(),
      type,
      content: getDefaultContent(type),
      src: type === 'image' ? 'https://via.placeholder.com/600x200' : '',
      styles: {
        color: '#000000',
        backgroundColor: type === 'button' ? '#0ea5e9' : 'transparent',
        fontSize: '16px',
        textAlign: 'left'
      }
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'text': return 'Enter your text here';
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
    <div className="glass rounded-xl p-8 min-h-[600px]">
      <div
        ref={drop}
        className={`
          bg-white rounded-xl shadow-inner min-h-[500px] p-6 transition-all
          ${isOver ? 'ring-4 ring-primary-500 ring-opacity-50 bg-primary-50' : ''}
        `}
      >
        {blocks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[400px] text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <FiMail className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">
              Start Building
            </h3>
            <p className="text-gray-600 max-w-md">
              Drag blocks from the left panel to start creating your email template
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span>Drag & Drop to add blocks</span>
            </div>
          </motion.div>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
