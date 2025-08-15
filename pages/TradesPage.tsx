


import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useTrades } from '../hooks/useTrades';
import { useAccounts } from '../hooks/useAccounts'; 
import { Trade, TradeOutcome, TradeDirection, MarketEnvironment } from '../types';
import { ICONS, MARKET_ENVIRONMENT_OPTIONS, getValueColorClasses } from '../constants'; 

const TradeListItem: React.FC<{ trade: Trade; accountName?: string }> = ({ trade, accountName }) => {
  const outcomeColor = 
    trade.outcome === TradeOutcome.WIN ? 'bg-emerald-100 text-emerald-700 dark:bg-success/20 dark:text-success' :
    trade.outcome === TradeOutcome.LOSS ? 'bg-red-100 text-red-700 dark:bg-danger/20 dark:text-danger' :
    'bg-slate-100 text-slate-600 dark:bg-gray-500/20 dark:text-gray-400';
  
  // For cost of discretion, negative is good (green), positive is bad (red)
  const costOfDiscretionColorClass = getValueColorClasses((trade.cost_of_discretion_r || 0) * -1);
  const mfeColorClass = getValueColorClasses(trade.mfe); // MFE is favorable, positive is green
  const maeColorClass = getValueColorClasses((trade.mae || 0) * -1); // MAE is adverse, positive stored value implies loss, so * -1 for red

  return (
    <tr className="border-b border-light-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-3 py-3 text-sm whitespace-nowrap text-light-text dark:text-dark-text">{new Date(trade.entry_timestamp).toLocaleDateString()}</td>
      <td className="px-3 py-3 text-sm font-medium text-light-text dark:text-dark-text">{trade.asset}</td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-light-text dark:text-dark-text" title={accountName}>{accountName || trade.account_id}</td>
      <td className={`px-3 py-3 text-sm font-semibold ${trade.direction === TradeDirection.LONG ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {trade.direction}
      </td>
      <td className="px-3 py-3 text-sm text-light-text dark:text-dark-text">{trade.entry_price.toFixed(2)}</td>
      <td className="px-3 py-3 text-sm text-light-text dark:text-dark-text">{trade.exit_price?.toFixed(2) || 'N/A'}</td>
      <td className="px-3 py-3 text-sm">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${outcomeColor}`}>
          {trade.outcome || 'Open'}
        </span>
      </td>
      <td className={`px-3 py-3 text-sm font-semibold ${getValueColorClasses(trade.r_multiple)}`}>
        {trade.r_multiple?.toFixed(2) || (trade.exit_price === undefined ? '-' : '0.00')}R
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-light-text dark:text-dark-text">{trade.trade_duration || '-'}</td>
      <td className="px-3 py-3 text-sm truncate max-w-xs text-light-text dark:text-dark-text" title={trade.setup_name}>{trade.setup_name || '-'}</td>
      <td className={`px-3 py-3 text-sm text-center font-semibold ${mfeColorClass}`}>{trade.mfe?.toFixed(1) ?? '-'}R</td>
      <td className={`px-3 py-3 text-sm text-center font-semibold ${maeColorClass}`}>{trade.mae?.toFixed(1) ?? '-'}R</td>
      <td className="px-3 py-3 text-sm text-center text-light-text dark:text-dark-text">{trade.atr_at_entry?.toFixed(2) || '-'}</td>
      <td className={`px-3 py-3 text-sm font-semibold text-center ${costOfDiscretionColorClass}`}>
        {trade.cost_of_discretion_r?.toFixed(2) ?? '-'}R
      </td>
      <td className="px-3 py-3 text-sm truncate max-w-[100px] text-light-text dark:text-dark-text" title={trade.tags?.join(', ')}>{trade.tags?.join(', ') || '-'}</td>
      <td className="px-3 py-3 text-sm">
        <Link to={`#`} className="text-primary-DEFAULT hover:text-primary-dark dark:hover:text-primary-light"> {/* TODO: Replace # with /trades/${trade.id} for detail view */}
          Details
        </Link>
      </td>
    </tr>
  );
};

const TradesPage: React.FC = () => {
  const { trades, isLoading, error } = useTrades();
  const { getActiveAccounts, getAccountById, isLoading: accountsLoading } = useAccounts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccountId, setFilterAccountId] = useState(''); 
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterSetupName, setFilterSetupName] = useState('');
  const [filterMarketEnv, setFilterMarketEnv] = useState<MarketEnvironment | ''>('');
  const [filterTag, setFilterTag] = useState('');

  const [sortBy, setSortBy] = useState('entry_timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [availableAccountsOptions, setAvailableAccountsOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const activeAccounts = getActiveAccounts();
    const options = activeAccounts.map(acc => ({ value: acc.id, label: acc.name }));
    setAvailableAccountsOptions([{value: '', label: 'All Accounts'}, ...options]);
  }, [getActiveAccounts]);


  const uniqueSetupNames = useMemo(() => {
    const names = new Set<string>();
    trades.forEach(trade => {
      if (trade.setup_name) names.add(trade.setup_name);
    });
    return Array.from(names).sort();
  }, [trades]);
  
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    trades.forEach(trade => {
        trade.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [trades]);


  const filteredAndSortedTrades = useMemo(() => {
    let processedTrades = [...trades];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      processedTrades = processedTrades.filter(trade => 
        trade.asset.toLowerCase().includes(lowerSearchTerm) ||
        (getAccountById(trade.account_id)?.name.toLowerCase().includes(lowerSearchTerm)) ||
        (trade.notes && trade.notes.toLowerCase().includes(lowerSearchTerm)) ||
        (trade.setup_name && trade.setup_name.toLowerCase().includes(lowerSearchTerm)) ||
        (trade.lessons_learned && trade.lessons_learned.toLowerCase().includes(lowerSearchTerm))
      );
    }
    if (filterAccountId) { 
      processedTrades = processedTrades.filter(trade => trade.account_id === filterAccountId);
    }
    if (filterOutcome) {
      processedTrades = processedTrades.filter(trade => trade.outcome === filterOutcome);
    }
    if (filterSetupName) {
      processedTrades = processedTrades.filter(trade => trade.setup_name === filterSetupName);
    }
    if (filterMarketEnv) {
      processedTrades = processedTrades.filter(trade => trade.market_environment === filterMarketEnv);
    }
    if (filterTag) {
        processedTrades = processedTrades.filter(trade => trade.tags?.includes(filterTag));
    }
    
    processedTrades.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortBy) {
        case 'asset': valA = a.asset; valB = b.asset; break;
        case 'account': valA = getAccountById(a.account_id)?.name || a.account_id; valB = getAccountById(b.account_id)?.name || b.account_id; break;
        case 'r_multiple': valA = a.r_multiple ?? -Infinity; valB = b.r_multiple ?? -Infinity; break; 
        case 'outcome': valA = a.outcome || ''; valB = b.outcome || ''; break;
        case 'trade_duration': valA = a.trade_duration_ms || 0; valB = b.trade_duration_ms || 0; break; // Sort by ms for accuracy
        case 'setup_name': valA = a.setup_name || ''; valB = b.setup_name || ''; break;
        case 'mfe': valA = a.mfe ?? -Infinity; valB = b.mfe ?? -Infinity; break;
        case 'mae': valA = a.mae ?? Infinity; valB = b.mae ?? Infinity; break; // Lower MAE is better, but it's stored positive. Sorting as numbers.
        case 'atr_at_entry': valA = a.atr_at_entry ?? -1; valB = b.atr_at_entry ?? -1; break; // Corrected id
        case 'cost_of_discretion_r': valA = a.cost_of_discretion_r ?? Infinity; valB = b.cost_of_discretion_r ?? Infinity; break; // Corrected id
        case 'tags': valA = a.tags?.join(',') || ''; valB = b.tags?.join(',') || ''; break;
        default: /* entry_timestamp */ valA = new Date(a.entry_timestamp).getTime(); valB = new Date(b.entry_timestamp).getTime();
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA);
      const strB = String(valB);
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return processedTrades;
  }, [trades, searchTerm, filterAccountId, filterOutcome, filterSetupName, filterMarketEnv, filterTag, sortBy, sortDirection, getAccountById]);

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortDirection('asc');
    }
  };
  
  const SortIndicator: React.FC<{ columnIdentifier: string }> = ({ columnIdentifier }) => {
    if (sortBy !== columnIdentifier) return null;
    return <span className="ml-1 text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  const tableHeaders = [
    { label: 'Date', id: 'entry_timestamp' }, 
    { label: 'Asset', id: 'asset' },
    { label: 'Account', id: 'account'}, 
    { label: 'Side', id: 'direction', sortable: false }, 
    { label: 'Entry', id: 'entry_price', sortable: false }, 
    { label: 'Exit', id: 'exit_price', sortable: false },   
    { label: 'Outcome', id: 'outcome' },
    { label: 'R', id: 'r_multiple' },     
    { label: 'Duration', id: 'trade_duration' },
    { label: 'Setup', id: 'setup_name' },   
    { label: 'MFE (R)', id: 'mfe' },
    { label: 'MAE (R)', id: 'mae' },
    { label: 'ATR@Entry', id: 'atr_at_entry' }, 
    { label: 'Disc. Cost (R)', id: 'cost_of_discretion_r' }, 
    { label: 'Tags', id: 'tags' },
    { label: 'Actions', id: 'actions', sortable: false },
  ];


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">All Trades</h2>
        <Link to="/new-trade">
          <Button variant="primary" leftIcon={<ICONS.PLUS_CIRCLE className="w-5 h-5"/>}>Log New Trade</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-2 items-end">
          <Input 
            label="Search"
            placeholder="Asset, Account, Setup..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            wrapperClassName="mb-0"
          />
          <Select
            label="Account"
            value={filterAccountId}
            onChange={(e) => setFilterAccountId(e.target.value)}
            options={availableAccountsOptions}
            wrapperClassName="mb-0"
            disabled={accountsLoading}
            placeholder={accountsLoading ? "Loading..." : "All Accounts"}
          />
          <Select
            label="Outcome"
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            options={[
              { value: '', label: 'All Outcomes' },
              { value: TradeOutcome.WIN, label: 'Wins' },
              { value: TradeOutcome.LOSS, label: 'Losses' },
              { value: TradeOutcome.BREAKEVEN, label: 'Breakeven' },
            ]}
            wrapperClassName="mb-0"
          />
          <Select
            label="Setup Name"
            value={filterSetupName}
            onChange={(e) => setFilterSetupName(e.target.value)}
            options={[{value: '', label: 'All Setups'}, ...uniqueSetupNames.map(name => ({ value: name, label: name }))]}
            wrapperClassName="mb-0"
          />
          <Select
            label="Market Env."
            value={filterMarketEnv}
            onChange={(e) => setFilterMarketEnv(e.target.value as MarketEnvironment | '')}
            options={[{value: '', label: 'All Environments'}, ...MARKET_ENVIRONMENT_OPTIONS.map(env => ({ value: env, label: env }))]}
            wrapperClassName="mb-0"
          />
           <Select
            label="Tag"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            options={[{value: '', label: 'All Tags'}, ...allTags.map(tag => ({ value: tag, label: tag }))]}
            wrapperClassName="mb-0"
          />
        </div>
      </Card>
      
      {isLoading && <p className="text-center py-4 text-light-text-secondary dark:text-dark-text-secondary">Loading trades...</p>}
      {error && <p className="text-center py-4 text-danger">{error}</p>}
      
      {!isLoading && !error && (
        <Card>
          {filteredAndSortedTrades.length === 0 ? (
            <p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">No trades found matching your criteria.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  {tableHeaders.map(header => (
                    <th 
                      key={header.id}
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      onClick={() => header.sortable !== false && handleSort(header.id)}
                    >
                      {header.label}
                      {header.sortable !== false && <SortIndicator columnIdentifier={header.id} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-light-card dark:bg-dark-card divide-y divide-light-border dark:divide-dark-border">
                {filteredAndSortedTrades.map(trade => (
                  <TradeListItem 
                      key={trade.id} 
                      trade={trade} 
                      accountName={getAccountById(trade.account_id)?.name} 
                  />
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default TradesPage;