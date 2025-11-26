import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { FiMove, FiTrash2 } from 'react-icons/fi';

const DraggableCanvasBlock = ({ block, index, moveBlock, deleteBlock, isSelected, onClick }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'CANVAS_BLOCK',
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'CANVAS_BLOCK',
    hover: (item, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  drag(drop(ref));

  const renderBlock = () => {
    const { type, content, src, styles } = block;

    switch (type) {
      case 'text':
        return (
          <div 
            style={{ 
              color: styles.color, 
              fontSize: styles.fontSize, 
              textAlign: styles.textAlign 
            }}
            className="py-2"
          >
            {content}
          </div>
        );
      case 'image':
        return (
          <img 
            src={src} 
            alt="Block" 
            className="max-w-full rounded-lg shadow-md"
          />
        );
      case 'button':
        return (
          <div style={{ textAlign: styles.textAlign }}>
            <button
              style={{
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                fontSize: styles.fontSize,
              }}
              className="px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              {content}
            </button>
          </div>
        );
      case 'divider':
        return <hr className="border-t-2 border-gray-300 my-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`
        relative group rounded-xl p-4 transition-all cursor-pointer
        ${isDragging ? 'opacity-50' : ''}
        ${isSelected 
          ? 'ring-2 ring-primary-500 bg-primary-50 shadow-lg' 
          : 'hover:bg-gray-50 hover:shadow-md'
        }
      `}
    >
      {/* Drag Handle */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center cursor-move shadow-lg">
          <FiMove className="text-white" size={14} />
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteBlock(block.id);
        }}
        className="absolute right-2 top-2 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
      >
        <FiTrash2 className="text-white" size={14} />
      </button>

      {/* Block Content */}
      <div className="pointer-events-none">
        {renderBlock()}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-xs font-bold">✓</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DraggableCanvasBlock;
