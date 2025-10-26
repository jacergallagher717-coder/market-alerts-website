const { useState, useEffect, createContext, useContext } = React;

const API_URL = 'https://market-impact-bot-v2.onrender.com';

// Auth Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const signup = async (email, password, displayName) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, display_name: displayName })
    });
    if (!response.ok) throw new Error('Signup failed');
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  return React.createElement(AuthContext.Provider, {
    value: { user, token, login, signup, logout, showAuthModal, setShowAuthModal }
  }, children);
}

function useAuth() {
  return useContext(AuthContext);
}

// Auth Modal Component
function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    onClick: () => setShowAuthModal(false)
  },
    React.createElement('div', {
      className: 'bg-gray-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-800',
      onClick: (e) => e.stopPropagation()
    },
      React.createElement('h2', { className: 'text-3xl font-bold text-white mb-2' },
        isLogin ? 'Welcome Back' : 'Create Account'
      ),
      React.createElement('p', { className: 'text-gray-400 mb-6' },
        isLogin ? 'Login to track your portfolio' : 'Start tracking your trade ideas'
      ),
      error && React.createElement('div', { className: 'bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4' },
        React.createElement('p', { className: 'text-red-400 text-sm' }, error)
      ),
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        !isLogin && React.createElement('input', {
          type: 'text',
          value: displayName,
          onChange: (e) => setDisplayName(e.target.value),
          placeholder: 'Display Name (optional)',
          className: 'w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white'
        }),
        React.createElement('input', {
          type: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: 'Email',
          required: true,
          className: 'w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white'
        }),
        React.createElement('input', {
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: 'Password',
          required: true,
          minLength: 6,
          className: 'w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white'
        }),
        React.createElement('button', {
          type: 'submit',
          disabled: loading,
          className: 'w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50'
        }, loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account')
      ),
      React.createElement('div', { className: 'mt-6 text-center' },
        React.createElement('button', {
          onClick: () => { setIsLogin(!isLogin); setError(''); },
          className: 'text-blue-400 hover:text-blue-300 text-sm'
        }, isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login')
      )
    )
  );
}

// Header Component
function Header() {
  const { user, logout, setShowAuthModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return React.createElement('header', { className: 'sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800' },
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      React.createElement('div', { className: 'flex items-center justify-between h-16' },
        React.createElement('div', { className: 'flex items-center space-x-2' },
          React.createElement('div', { className: 'text-2xl' }, '📊'),
          React.createElement('span', { className: 'text-xl font-bold text-white' }, 'Market Alerts'),
          React.createElement('span', {
            className: 'px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full'
          }, 'ELITE')
        ),
        user
          ? React.createElement('div', { className: 'relative' },
              React.createElement('button', {
                onClick: () => setShowUserMenu(!showUserMenu),
                className: 'flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors'
              },
                React.createElement('div', {
                  className: 'w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold'
                }, (user.display_name?.[0] || user.email[0]).toUpperCase()),
                React.createElement('span', { className: 'text-white' }, user.display_name || user.email)
              ),
              showUserMenu && React.createElement('div', {
                className: 'absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2'
              },
                React.createElement('div', { className: 'px-4 py-2 border-b border-gray-700' },
                  React.createElement('p', { className: 'text-sm text-gray-400' }, 'Signed in as'),
                  React.createElement('p', { className: 'text-sm font-medium text-white truncate' }, user.email)
                ),
                React.createElement('button', {
                  onClick: () => { logout(); setShowUserMenu(false); },
                  className: 'block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700'
                }, '🚪 Logout')
              )
            )
          : React.createElement('button', {
              onClick: () => setShowAuthModal(true),
              className: 'px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all'
            }, 'Login / Sign Up')
      )
    )
  );
}

// Alert Card Component
function AlertCard({ alert, alertId }) {
  const { user, token, setShowAuthModal } = useAuth();
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [addingToPortfolio, setAddingToPortfolio] = useState(null);

  const addToPortfolio = async (tradeIndex) => {
    if (!token) {
      alert('Please login to add trades to your portfolio');
      setShowAuthModal(true);
      return;
    }

    setAddingToPortfolio(tradeIndex);
    try {
      const response = await fetch(`${API_URL}/api/portfolio/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          alert_id: alertId,
          trade_idea_index: tradeIndex
        })
      });
      if (!response.ok) throw new Error('Failed to add to portfolio');
      alert('✅ Added to portfolio!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingToPortfolio(null);
    }
  };

  const event = alert.event || {};
  const tradeIdeas = alert.trade_ideas || [];
  const whyItMatters = alert.why_it_matters || [];

  return React.createElement('div', { className: 'bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all' },
    React.createElement('div', { className: 'flex items-start justify-between mb-4' },
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex items-center space-x-2 mb-2' },
          React.createElement('span', { className: 'px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full' },
            (event.category || 'MARKET').toUpperCase()
          ),
          React.createElement('span', { className: 'px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full' },
            event.source || 'NEWS'
          )
        ),
        React.createElement('h3', { className: 'text-xl font-bold text-white mb-2' }, event.headline),
        React.createElement('p', { className: 'text-sm text-gray-400' },
          `${new Date(event.detected_at).toLocaleString()} • Confidence: ${Math.round(event.confidence * 100)}%`
        )
      )
    ),
    React.createElement('div', { className: 'mb-6' },
      React.createElement('h4', { className: 'text-sm font-semibold text-gray-300 mb-2' }, '💡 Why It Matters:'),
      React.createElement('ul', { className: 'space-y-1' },
        whyItMatters.map((point, idx) =>
          React.createElement('li', { key: idx, className: 'text-sm text-gray-400 flex items-start' },
            React.createElement('span', { className: 'text-blue-400 mr-2' }, '•'),
            point
          )
        )
      )
    ),
    React.createElement('div', { className: 'space-y-3' },
      React.createElement('h4', { className: 'text-sm font-semibold text-gray-300 mb-3' }, '🎯 Trade Ideas:'),
      tradeIdeas.map((trade, idx) =>
        React.createElement('div', {
          key: idx,
          className: 'bg-gray-900/50 rounded-lg p-4 border border-gray-700'
        },
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('div', { className: 'flex items-center space-x-3' },
              React.createElement('span', { className: 'text-xl font-bold text-white' }, trade.ticker),
              React.createElement('span', { className: 'text-sm font-semibold text-green-400' },
                (trade.direction || 'LONG').toUpperCase()
              )
            ),
            user && React.createElement('button', {
              onClick: () => addToPortfolio(idx),
              disabled: addingToPortfolio === idx,
              className: 'px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50'
            }, addingToPortfolio === idx ? '...' : '+ Add to Portfolio')
          ),
          React.createElement('p', { className: 'text-sm text-gray-300 mb-3' },
            React.createElement('strong', null, 'Strategy: '),
            trade.strategy
          ),
          React.createElement('div', { className: 'grid grid-cols-4 gap-3 mb-3' },
            React.createElement('div', { className: 'bg-gray-800 rounded-lg p-3' },
              React.createElement('p', { className: 'text-xs text-gray-500 mb-1' }, 'Entry'),
              React.createElement('p', { className: 'text-sm font-bold text-white' }, trade.entry_price)
            ),
            React.createElement('div', { className: 'bg-gray-800 rounded-lg p-3' },
              React.createElement('p', { className: 'text-xs text-gray-500 mb-1' }, 'Target'),
              React.createElement('p', { className: 'text-sm font-bold text-green-400' }, trade.target_price)
            ),
            React.createElement('div', { className: 'bg-gray-800 rounded-lg p-3' },
              React.createElement('p', { className: 'text-xs text-gray-500 mb-1' }, 'Stop Loss'),
              React.createElement('p', { className: 'text-sm font-bold text-red-400' }, trade.stop_loss)
            ),
            React.createElement('div', { className: 'bg-gray-800 rounded-lg p-3' },
              React.createElement('p', { className: 'text-xs text-gray-500 mb-1' }, 'R/R'),
              React.createElement('p', { className: 'text-sm font-bold text-blue-400' }, trade.risk_reward_ratio)
            )
          )
        )
      )
    ),
    !user && tradeIdeas.length > 0 && React.createElement('div', {
      className: 'mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg'
    },
      React.createElement('p', { className: 'text-sm text-blue-300' },
        '💡 ',
        React.createElement('strong', null, 'Login to track these trades'),
        ' and see your portfolio performance!'
      )
    )
  );
}

// Main App
function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(AuthProvider, null,
    React.createElement(Header),
    React.createElement(AuthModal),
    React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement('div', { className: 'text-center mb-12' },
          React.createElement('h1', {
            className: 'text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4'
          }, 'Elite Market Alerts'),
          React.createElement('p', { className: 'text-xl text-gray-400' },
            'AI-powered trade ideas with institutional-level analysis'
          )
        ),
        loading
          ? React.createElement('div', { className: 'text-center py-12' },
              React.createElement('div', {
                className: 'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4'
              }),
              React.createElement('p', { className: 'text-gray-400' }, 'Loading elite market alerts...')
            )
          : React.createElement('div', { className: 'space-y-6' },
              alerts.length === 0
                ? React.createElement('div', { className: 'text-center py-12' },
                    React.createElement('p', { className: 'text-gray-400 text-lg' },
                      'No alerts yet. Waiting for market-moving news...'
                    )
                  )
                : alerts.map((alert, index) =>
                    React.createElement(AlertCard, {
                      key: index,
                      alert: alert,
                      alertId: index + 1
                    })
                  )
            )
      )
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
