"use client";

import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface TradeIdea {
  ticker: string;
  direction: string;
  strategy: string;
  rationale: string;
  conviction: string;
  entry_price: string;
  target_price: string;
  stop_loss: string;
  time_horizon: string;
  risk_reward_ratio: string;
}

interface Alert {
  event: {
    headline: string;
    category: string;
    confidence: number;
    detected_at: string;
    primary_direction: string;
    source: string;
  };
  why_it_matters: string[];
  trade_ideas: TradeIdea[];
}

interface AlertCardProps {
  alert: Alert;
  alertId: number;
}

const API_URL = 'https://market-impact-bot-v2.onrender.com';

export default function AlertCard({ alert, alertId }: AlertCardProps) {
  const { user, token } = useAuth();
  const [expandedTrade, setExpandedTrade] = useState<number | null>(null);
  const [addingToPortfolio, setAddingToPortfolio] = useState<number | null>(null);

  const addToPortfolio = async (tradeIndex: number) => {
    if (!token) {
      alert('Please login to add trades to your portfolio');
      return;
    }

    setAddingToPortfolio(tradeIndex);

    try {
      const response = await fetch(`${API_URL}/api/portfolio/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          alert_id: alertId,
          trade_idea_index: tradeIndex,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to add to portfolio');
      }

      alert('✅ Added to portfolio!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingToPortfolio(null);
    }
  };

  const getDirectionColor = (direction: string) => {
    if (direction === 'bullish' || direction === 'long') return 'text-green-400';
    if (direction === 'bearish' || direction === 'short') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getDirectionBg = (direction: string) => {
    if (direction === 'bullish' || direction === 'long') return 'bg-green-500/10 border-green-500/30';
    if (direction === 'bearish' || direction === 'short') return 'bg-red-500/10 border-red-500/30';
    return 'bg-yellow-500/10 border-yellow-500/30';
  };

  const getConvictionColor = (conviction: string) => {
    if (conviction === 'high') return 'bg-green-500/20 text-green-400';
    if (conviction === 'medium') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
              {alert.event.category.toUpperCase()}
            </span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
              {alert.event.source}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDirectionBg(alert.event.primary_direction)}`}>
              {alert.event.primary_direction.toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{alert.event.headline}</h3>
          <p className="text-sm text-gray-400">
            {new Date(alert.event.detected_at).toLocaleString()} • Confidence: {Math.round(alert.event.confidence * 100)}%
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">💡 Why It Matters:</h4>
        <ul className="space-y-1">
          {alert.why_it_matters.map((point, idx) => (
            <li key={idx} className="text-sm text-gray-400 flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">🎯 Trade Ideas:</h4>
        {alert.trade_ideas.map((trade, idx) => (
          <div
            key={idx}
            className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-white">{trade.ticker}</span>
                <span className={`text-sm font-semibold ${getDirectionColor(trade.direction)}`}>
                  {trade.direction.toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConvictionColor(trade.conviction)}`}>
                  {trade.conviction.toUpperCase()} CONVICTION
                </span>
              </div>
              
              {user && (
                <button
                  onClick={() => addToPortfolio(idx)}
                  disabled={addingToPortfolio === idx}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {addingToPortfolio === idx ? '...' : '+ Add to Portfolio'}
                </button>
              )}
            </div>

            <p className="text-sm text-gray-300 mb-3">
              <strong>Strategy:</strong> {trade.strategy}
            </p>

            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Entry</p>
                <p className="text-sm font-bold text-white">{trade.entry_price}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Target</p>
                <p className="text-sm font-bold text-green-400">{trade.target_price}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Stop Loss</p>
                <p className="text-sm font-bold text-red-400">{trade.stop_loss}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">R/R</p>
                <p className="text-sm font-bold text-blue-400">{trade.risk_reward_ratio}</p>
              </div>
            </div>

            <button
              onClick={() => setExpandedTrade(expandedTrade === idx ? null : idx)}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>{expandedTrade === idx ? '▼' : '▶'}</span>
              <span>{expandedTrade === idx ? 'Hide Details' : 'Show Details'}</span>
            </button>

            {expandedTrade === idx && (
              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rationale:</p>
                  <p className="text-sm text-gray-300">{trade.rationale}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time Horizon:</p>
                  <p className="text-sm text-gray-300">{trade.time_horizon}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!user && alert.trade_ideas.length > 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Login to track these trades</strong> and see your portfolio performance!
          </p>
        </div>
      )}
    </div>
  );
}
