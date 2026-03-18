import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaHistory,
  FaCreditCard,
  FaBitcoin,
  FaPaypal,
  FaUniversity,
  FaCopy,
  FaCheck
} from 'react-icons/fa';
import './Wallet.css';

const Wallet = () => {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState({ balance: 0, bonus: 0, total: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/wallet/balance');
      setBalance(response.data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/wallet/transactions?limit=10');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || !paymentMethod) return;

    setProcessing(true);
    try {
      await axios.post('/api/wallet/deposit', {
        amount: parseFloat(amount),
        paymentMethod
      });
      setShowDepositModal(false);
      setAmount('');
      setPaymentMethod('');
      fetchBalance();
      fetchTransactions();
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || !paymentMethod) return;

    setProcessing(true);
    try {
      await axios.post('/api/wallet/withdraw', {
        amount: parseFloat(amount),
        paymentMethod
      });
      setShowWithdrawModal(false);
      setAmount('');
      setPaymentMethod('');
      fetchBalance();
      fetchTransactions();
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <FaArrowDown className="tx-icon deposit" />;
      case 'withdrawal':
        return <FaArrowUp className="tx-icon withdrawal" />;
      case 'bet':
        return <FaExchangeAlt className="tx-icon bet" />;
      case 'win':
        return <FaWallet className="tx-icon win" />;
      case 'bonus':
        return <FaWallet className="tx-icon bonus" />;
      default:
        return <FaExchangeAlt className="tx-icon" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'bonus':
        return 'positive';
      case 'withdrawal':
      case 'bet':
        return 'negative';
      default:
        return '';
    }
  };

  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', icon: FaCreditCard },
    { id: 'debit_card', name: 'Debit Card', icon: FaCreditCard },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: FaUniversity },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal },
  ];

  return (
    <div className="wallet-page">
      <div className="container">
        {/* Header */}
        <div className="wallet-header">
          <h1>My Wallet</h1>
          <div className="wallet-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowDepositModal(true)}
            >
              <FaArrowDown /> Deposit
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowWithdrawModal(true)}
            >
              <FaArrowUp /> Withdraw
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="wallet-balance-grid">
          <div className="balance-card main">
            <div className="balance-header">
              <span className="balance-label">Total Balance</span>
              <FaWallet className="balance-icon" />
            </div>
            <div className="balance-amount">
              ${balance.total.toFixed(2)}
            </div>
            <div className="balance-currency">USD</div>
          </div>

          <div className="balance-card">
            <div className="balance-header">
              <span className="balance-label">Available</span>
            </div>
            <div className="balance-amount">
              ${balance.balance.toFixed(2)}
            </div>
          </div>

          <div className="balance-card bonus">
            <div className="balance-header">
              <span className="balance-label">Bonus</span>
            </div>
            <div className="balance-amount">
              ${balance.bonus.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="wallet-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button
            className={activeTab === 'payment' ? 'active' : ''}
            onClick={() => setActiveTab('payment')}
          >
            Payment Methods
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="wallet-overview">
            <h2>Recent Transactions</h2>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="transactions-list">
                {transactions.map((tx) => (
                  <div key={tx._id} className="transaction-item">
                    <div className="transaction-icon">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-type">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </div>
                      <div className="transaction-date">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`transaction-amount ${getTransactionColor(tx.type)}`}>
                      {tx.amount > 0 ? '+' : ''}
                      ${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaHistory className="empty-state-icon" />
                <h3>No transactions yet</h3>
                <p>Your transaction history will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="wallet-transactions">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>
                        <div className="tx-type">
                          {getTransactionIcon(tx.type)}
                          <span>{tx.type}</span>
                        </div>
                      </td>
                      <td className={getTransactionColor(tx.type)}>
                        {tx.amount > 0 ? '+' : ''}
                        ${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${tx.status}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="wallet-payment-methods">
            <div className="payment-methods-grid">
              {paymentMethods.map((method) => (
                <div key={method.id} className="payment-method-card">
                  <div className="payment-method-icon">
                    <method.icon />
                  </div>
                  <div className="payment-method-info">
                    <span className="payment-method-name">{method.name}</span>
                    <span className="payment-method-status">Available</span>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deposit Funds</h3>
              <button
                className="modal-close"
                onClick={() => setShowDepositModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="10"
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-methods-select">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        className={`payment-method-btn ${paymentMethod === method.id ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <method.icon />
                        <span>{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDepositModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing || !amount || !paymentMethod}
                >
                  {processing ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Withdraw Funds</h3>
              <button
                className="modal-close"
                onClick={() => setShowWithdrawModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="20"
                    max={balance.balance}
                    className="input"
                    required
                  />
                  <span className="input-hint">
                    Available: ${balance.balance.toFixed(2)}
                  </span>
                </div>
                <div className="form-group">
                  <label>Withdrawal Method</label>
                  <div className="payment-methods-select">
                    {paymentMethods.slice(2).map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        className={`payment-method-btn ${paymentMethod === method.id ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <method.icon />
                        <span>{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing || !amount || !paymentMethod}
                >
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
