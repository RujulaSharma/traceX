import React, { useState } from 'react';
import { AttackGraphData, GraphNode } from '../../types';
import { Network, User, ShieldAlert, Zap, Server, ChevronRight, Layers } from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';

interface AttackGraphProps {
  graphData: AttackGraphData;
  onSelectNode?: (node: GraphNode) => void;
}

export const AttackGraph: React.FC<AttackGraphProps> = ({ graphData, onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400">
        <Layers className="w-8 h-8 text-slate-600 mb-2" />
        <p className="text-sm">No graph topology available for this incident.</p>
      </div>
    );
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'attacker_ip':
        return <Network className="w-5 h-5 text-red-400" />;
      case 'compromised_user':
        return <User className="w-5 h-5 text-amber-400" />;
      case 'target_ip':
        return <Server className="w-5 h-5 text-cyan-400" />;
      case 'detection_rule':
        return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
      case 'attack_stage':
        return <Zap className="w-5 h-5 text-purple-400" />;
      default:
        return <ChevronRight className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNodeBorder = (type: string, isSelected: boolean) => {
    if (isSelected) return 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.4)]';
    switch (type) {
      case 'attacker_ip':
        return 'border-red-500/50 hover:border-red-400 bg-red-950/20';
      case 'compromised_user':
        return 'border-amber-500/50 hover:border-amber-400 bg-amber-950/20';
      case 'target_ip':
        return 'border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/20';
      case 'detection_rule':
        return 'border-indigo-500/50 hover:border-indigo-400 bg-indigo-950/20';
      case 'attack_stage':
        return 'border-purple-500/50 hover:border-purple-400 bg-purple-950/20';
      default:
        return 'border-slate-800 hover:border-slate-700 bg-slate-900';
    }
  };

  // Group nodes by type for clear topology visualization
  const attackerNodes = graphData.nodes.filter((n) => n.type === 'attacker_ip');
  const userNodes = graphData.nodes.filter((n) => n.type === 'compromised_user');
  const detectionNodes = graphData.nodes.filter((n) => n.type === 'detection_rule');
  const targetNodes = graphData.nodes.filter((n) => n.type === 'target_ip');
  const stageNodes = graphData.nodes.filter((n) => n.type === 'attack_stage');

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-slate-300">
            Interactive Attack Topology Graph
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-slate-400">Attacker IP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">Compromised User</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-400">Triggered Rule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-400">Kill Chain Stage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-400">Target Asset</span>
          </div>
        </div>
      </div>

      {/* Structured Graph Canvas */}
      <div className="relative rounded-2xl bg-[#070b12] border border-slate-800/80 p-6 min-h-[420px] overflow-hidden flex flex-col justify-between">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />

        {/* 4-Tier Topology Columns */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Column 1: Attacker Entrypoint */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 pb-2 border-b border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Entrypoint (Attacker)
            </div>
            {attackerNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${getNodeBorder(
                  node.type,
                  selectedNode?.id === node.id
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-950/80 border border-red-800">
                    {getNodeIcon(node.type)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block">
                      Origin IP
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{node.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Victims / Identities */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 pb-2 border-b border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Compromised Identity
            </div>
            {userNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${getNodeBorder(
                  node.type,
                  selectedNode?.id === node.id
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800">
                    {getNodeIcon(node.type)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      Target Account
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{node.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Rules & Detection Findings */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 pb-2 border-b border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> Detection Signals ({detectionNodes.length})
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {detectionNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 ${getNodeBorder(
                    node.type,
                    selectedNode?.id === node.id
                  )}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      Rule Signal
                    </span>
                    {node.severity && <SeverityBadge severity={node.severity} size="sm" />}
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight">{node.label}</div>
                  {node.stage && (
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{node.stage}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Kill Chain Stages & Target Assets */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 pb-2 border-b border-purple-500/20">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Stages & Assets
            </div>
            <div className="space-y-2">
              {stageNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 ${getNodeBorder(
                    node.type,
                    selectedNode?.id === node.id
                  )}`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-xs font-bold text-white">{node.label}</span>
                  </div>
                </div>
              ))}

              {targetNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 ${getNodeBorder(
                    node.type,
                    selectedNode?.id === node.id
                  )}`}
                >
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-cyan-400 block font-mono">Target Asset</span>
                      <span className="text-xs font-bold font-mono text-white">{node.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-950/60 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                {getNodeIcon(selectedNode.type)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                  Selected Entity: {selectedNode.type.replace('_', ' ')}
                </span>
                <span className="font-bold text-white text-sm">{selectedNode.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedNode.severity && <SeverityBadge severity={selectedNode.severity} size="md" />}
              {selectedNode.stage && (
                <span className="px-2 py-1 rounded bg-purple-950 border border-purple-800 text-purple-300 font-semibold text-xs">
                  {selectedNode.stage}
                </span>
              )}
              {selectedNode.confidence && (
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs">
                  Confidence: {Math.round(selectedNode.confidence * 100)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Relational Correlation Summary */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Correlated Edges:</span>
          <span>{graphData.edges.length} multi-stage causal links verified</span>
        </div>
        <div className="font-mono text-cyan-400">
          Clustered by Shared IP & Username Pivot Points
        </div>
      </div>
    </div>
  );
};
