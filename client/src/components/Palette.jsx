import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { FiType, FiImage, FiSquare, FiMinus } from 'react-icons/fi';

const DraggableBlock = ({ type, label, icon: Icon, color }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'BLOCK',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  console.log(`Block ${type} - isDragging:`, isDragging);

  return (
    <div
      ref={drag}
      className={`
        glass rounded-xl p-4 cursor-move transition-all hover:scale-105 hover:-translate-y-1
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg'}
      `}
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          <Icon className="text-white" size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">Drag to add</p>
        </div>
      </div>
    </div>
  );
};

const Palette = () => {
  const blocks = [
    { type: 'text', label: 'Text', icon: FiType, color: 'from-blue-500 to-cyan-500' },
    { type: 'image', label: 'Image', icon: FiImage, color: 'from-purple-500 to-pink-500' },
    { type: 'button', label: 'Button', icon: FiSquare, color: 'from-orange-500 to-red-500' },
    { type: 'divider', label: 'Divider', icon: FiMinus, color: 'from-green-500 to-teal-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-xl p-6 sticky top-24"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1 font-display">
          Building Blocks
        </h3>
        <p className="text-sm text-gray-600">
          Drag blocks to canvas
        </p>
      </div>
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <motion.div
            key={block.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <DraggableBlock {...block} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Palette;
