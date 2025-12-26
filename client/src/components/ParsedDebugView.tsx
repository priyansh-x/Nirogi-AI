import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
    chunks: any[];
    blocks: any[];
    facts?: any[]; // New prop
}

export const ParsedDebugView = ({ chunks, blocks, facts = [] }: Props) => {
    if (!chunks || chunks.length === 0) {
        return <div className="text-gray-500 text-sm p-4">No parsed data available yet. Please run Parse first.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
            {/* Text Chunks */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 border-r border-gray-100">
                <h3 className="font-semibold text-gray-900 sticky top-0 bg-gray-50 py-2 z-10">Text Chunks</h3>
                {chunks.map((chunk) => (
                    <Card key={chunk.id} className="p-3 text-sm text-gray-600 group hover:border-blue-300">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-blue-600 font-mono">Chunk #{chunk.chunkIndex}</span>
                        </div>
                        {chunk.content}
                    </Card>
                ))}
            </div>

            {/* Layout Blocks */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 border-r border-gray-100">
                <h3 className="font-semibold text-gray-900 sticky top-0 bg-gray-50 py-2 z-10">Layout Blocks</h3>
                {blocks.map((block) => (
                    <Card key={block.id} className="p-3 text-sm group hover:border-green-300">
                        <div className="flex justify-between items-center mb-2">
                            <Badge variant="neutral" className="text-[10px]">{block.type}</Badge>
                            <div className="text-xs text-gray-400">Page {block.bboxPage}</div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{block.content}</p>
                        <div className="mt-2 text-[10px] text-gray-400 font-mono">
                            conf: {block.confidence} | box: [{block.bboxLeft.toFixed(2)}, {block.bboxTop.toFixed(2)}, {block.bboxWidth.toFixed(2)}, {block.bboxHeight.toFixed(2)}]
                        </div>
                    </Card>
                ))}
            </div>

            {/* Structured Facts */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                <h3 className="font-semibold text-gray-900 sticky top-0 bg-gray-50 py-2 z-10">Extracted Facts</h3>
                {facts.length > 0 ? facts.map((fact) => {
                    const data = JSON.parse(fact.dataJson);
                    return (
                        <Card key={fact.id} className="p-3 text-sm group hover:border-purple-300 border-l-4 border-l-purple-500">
                            <div className="flex justify-between items-center mb-2">
                                <Badge variant="neutral" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">{fact.factType}</Badge>
                                <div className="text-xs text-gray-400">{(fact.confidence * 100).toFixed(0)}% Conf</div>
                            </div>
                            <div className="font-bold text-gray-900 mb-1">{data.value}</div>
                            {data.description && <div className="text-xs text-gray-500 mb-2">{data.description}</div>}
                        </Card>
                    );
                }) : (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                        No structured facts extracted from this document.
                    </div>
                )}
            </div>
        </div>
    );
};
