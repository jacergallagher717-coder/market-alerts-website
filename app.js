const { useState, useEffect } = React;

const API_URL = 'https://market-impact-bot-v2.onrender.com/api/alerts';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchAlerts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setAlerts(data.alerts || []);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return React.createElement('div', { className: 'min-h-screen bg-gray-900 flex items-center justify-center' },
      React.createElement('div', { className: 'text-white text-xl' }, 'Loading...')
    );
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-900 text-white' },
    React.createElement('header', { className: 'bg-gray-800 border-b border-gray-700 p-6' },
      React.createElement('div', { className: 'max-w-7xl mx-auto' },
        React.createElement('h1', { className: 'text-3xl font-bold' }, '📊 Live Market Impact Alerts'),
        React.createElement('p', { className: 'text-gray-400 mt-2' },
          `Real-time AI-powered trade analysis • Updated: ${lastUpdate.toLocaleTimeString()}`
        )
      )
    ),
    React.createElement('main', { className: 'max-w-7xl mx-auto p-6' },
      alerts.length === 0 
        ? React.createElement('div', { className: 'bg-gray-800 rounded-lg p-12 text-center' },
            React.createElement('div', { className: 'text-6xl mb-4' }, '📭'),
            React.createElement('h2', { className: 'text-2xl font-semibold mb-2' }, 'No Alerts Yet')
          )
        : React.createElement('div', { className: 'space-y-6' },
            alerts.map((alert, i) => React.createElement(AlertCard, { key: i, alert }))
          )
    ),
    React.createElement('footer', { className: 'bg-gray-800 border-t border-gray-700 p-4 mt-12 text-center text-gray-400 text-sm' },
      '⚠️ Not financial advice. Educational purposes only.'
    )
  );
}

function AlertCard({ alert }) {
  const event = alert.event || {};
  const trade = alert.trade_idea || {};
  const isUp = trade.direction === 'bullish';

  return React.createElement('div', { className: 'bg-gray-800 rounded-xl border border-gray-700 shadow-xl' },
    React.createElement('div', { className: 'bg-gradient-to-r from-blue-900 to-purple-900 p-6' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-2' }, event.headline),
      React.createElement('div', { className: 'flex gap-3 text-sm flex-wrap' },
        React.createElement('span', { className: 'bg-gray-700 px-3 py-1 rounded' }, event.category),
        React.createElement('span', { className: 'bg-green-900 text-green-300 px-3 py-1 rounded' },
          `${Math.round(event.confidence * 100)}% Confidence`
        )
      )
    ),
    React.createElement('div', { className: 'p-6 space-y-6' },
      React.createElement('div', null,
        React.createElement('h3', { className: 'font-semibold text-lg mb-3' }, '💡 Why It Matters'),
        React.createElement('ul', { className: 'space-y-2' },
          (alert.why_it_matters || []).map((point, i) =>
            React.createElement('li', { key: i, className: 'flex gap-2 text-gray-300' },
              React.createElement('span', { className: 'text-blue-400' }, '•'),
              React.createElement('span', null, point)
            )
          )
        )
      ),
      React.createElement('div', null,
        React.createElement('h3', { className: 'font-semibold text-lg mb-3' }, '📈 Affected Assets'),
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-3' },
          (alert.affected_assets || []).map((asset, i) =>
            React.createElement('div', { key: i, className: 'bg-gray-700 rounded-lg p-3' },
              React.createElement('div', { className: 'flex justify-between mb-1' },
                React.createElement('span', { className: 'font-mono font-bold' }, asset.ticker),
                React.createElement('span', { className: asset.direction === 'up' ? 'text-green-400' : 'text-red-400' },
                  asset.direction === 'up' ? '📈' : '📉'
                )
              ),
              React.createElement('p', { className: 'text-xs text-gray-400' }, asset.rationale)
            )
          )
        )
      ),
      React.createElement('div', { className: 'bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600' },
        React.createElement('h3', { className: 'font-bold text-xl mb-4' }, '🎯 Trade Idea'),
        React.createElement('div', { className: 'flex items-center gap-3 mb-4 flex-wrap' },
          React.createElement('span', { className: 'font-mono font-bold text-3xl' }, trade.ticker),
          React.createElement('div', {
            className: `px-4 py-2 rounded-full font-semibold ${
              isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`
          }, isUp ? '📈 BULLISH' : '📉 BEARISH'),
          React.createElement('div', { className: 'bg-blue-600 px-3 py-1 rounded text-sm' },
            (trade.strategy || '').toUpperCase()
          )
        ),
        React.createElement('div', { className: 'bg-gray-900/50 rounded-lg p-4 mb-4' },
          React.createElement('h4', { className: 'font-semibold text-blue-400 mb-2' }, 'Rationale'),
          React.createElement('p', { className: 'text-gray-300' }, trade.rationale)
        ),
        React.createElement('div', { className: 'bg-red-900/20 border border-red-800 rounded-lg p-4' },
          React.createElement('h4', { className: 'font-semibold text-red-400 mb-2' }, '⚠️ Risk'),
          React.createElement('p', { className: 'text-red-300 text-sm' }, trade.risk)
        )
      )
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
