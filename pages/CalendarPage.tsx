import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect
import { Link } from 'react-router-dom';
import { useTrades } from '../hooks/useTrades';
import { usePriceActionLogs } from '../hooks/usePriceActionLogs'; // New hook
import { PriceActionLogEntry, Trade } from '../types'; 
import { ICONS, getValueColorClasses } from '../constants';
import Button from '../components/ui/Button';


interface DayData {
  total_r: number;
  trade_count: number;
  has_note: boolean; // Represents a PA Log note
}

const CalendarPage: React.FC = () => {
  const { trades } = useTrades();
  const { logs: priceActionLogs } = usePriceActionLogs(); // Use the new hook
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());


  const dailyNotesMap = useMemo(() => {
    const map = new Map<string, boolean>();
    // Use PriceActionLogEntry for daily notes indicator
    priceActionLogs.forEach(log => {
        map.set(log.entry_date, true); 
    });
    return map;
  }, [priceActionLogs]); 

  const monthlyData = useMemo(() => {
    const dataByDay = new Map<string, DayData>();
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    trades.forEach(trade => {
      const tradeDate = new Date(trade.entry_timestamp);
      if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
        const dayKey = tradeDate.toISOString().split('T')[0];
        const dayData = dataByDay.get(dayKey) || { total_r: 0, trade_count: 0, has_note: dailyNotesMap.has(dayKey) };
        dayData.total_r += trade.r_multiple || 0;
        dayData.trade_count += 1;
        dataByDay.set(dayKey, dayData);
      }
    });
    // Ensure days with only notes are also represented
    for (const [dateKey, hasNoteEntry] of dailyNotesMap.entries()) {
        if (hasNoteEntry) {
            const noteDate = new Date(dateKey + 'T00:00:00'); // Ensure correct date parsing
             if (noteDate.getFullYear() === year && noteDate.getMonth() === month) {
                 if (!dataByDay.has(dateKey)) { // Only add if no trades on this day
                    dataByDay.set(dateKey, { total_r: 0, trade_count: 0, has_note: true });
                 } else { // If trades exist, ensure hasNote is true
                    const existingData = dataByDay.get(dateKey)!;
                    existingData.has_note = true;
                    dataByDay.set(dateKey, existingData);
                 }
             }
        }
    }

    return dataByDay;
  }, [trades, currentMonthDate, dailyNotesMap]);

  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay(); 
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleToday = () => {
    setCurrentMonthDate(new Date());
  };

  const formatRValue = (rValue: number): string => {
    if (rValue === 0 && Math.abs(rValue) > 0.0001) return "0.0R"; // Handles very small non-zero numbers
    if (rValue === 0) return "0.0R";
    const sign = rValue > 0 ? '+' : '';
    if (Math.abs(rValue) >= 1000) {
      return `${sign}${(rValue / 1000).toFixed(1)}KR`;
    }
    return `${sign}${rValue.toFixed(1)}R`;
  };

  const renderCell = (dayNumber: number) => {
    const dateKey = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), dayNumber).toISOString().split('T')[0];
    const data = monthlyData.get(dateKey);
    const today = new Date();
    const isCurrentDay = dayNumber === today.getDate() && currentMonthDate.getMonth() === today.getMonth() && currentMonthDate.getFullYear() === today.getFullYear();

    let bgColor = 'bg-light-card dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-slate-700/50';
    let textColorClass = getValueColorClasses(data?.total_r);
    
    if (data?.total_r && data.total_r > 0.001) {
      bgColor = 'bg-emerald-100 dark:bg-success/20 hover:bg-emerald-200 dark:hover:bg-success/30';
    } else if (data?.total_r && data.total_r < -0.001) {
      bgColor = 'bg-red-100 dark:bg-danger/20 hover:bg-red-200 dark:hover:bg-danger/30';
    }
    
    const cellContent = (
      <div className={`relative h-32 md:h-36 p-1.5 md:p-2 border border-light-border dark:border-dark-border flex flex-col justify-between transition-colors duration-150 ${bgColor}`}>
        <div className="flex justify-between items-start">
            <span className={`text-xs md:text-sm font-medium ${isCurrentDay ? 'bg-primary-DEFAULT text-white rounded-full px-1.5 py-0.5' : 'text-light-text dark:text-dark-text'}`}>
                {dayNumber}
            </span>
            {data?.has_note && <span title="Price Action Logged"><ICONS.REVIEW_SYSTEM className="w-3 h-3 md:w-4 md:h-4 text-sky-500 opacity-70" /></span>}
        </div>
        {data && data.trade_count > 0 && (
          <div className="text-center flex-grow flex flex-col justify-center items-center">
            <p className={`text-sm md:text-lg font-bold ${textColorClass}`}>
              {formatRValue(data.total_r)}
            </p>
            <p className="text-xxs md:text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5 md:mt-1">
              {data.trade_count} trade{data.trade_count > 1 ? 's' : ''}
            </p>
          </div>
        )}
         {data && data.trade_count === 0 && data.has_note && (
            <div className="text-center flex-grow flex flex-col justify-center items-center">
                 <p className="text-xxs md:text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5 md:mt-1">(PA Log)</p>
            </div>
        )}
      </div>
    );
    
    // Link to trades page first, can decide later if PA log needs a different link or combined view
    const linkState = { filterDate: dateKey }; 

    return (
        <Link to="/trades" state={linkState} className="block">
           {cellContent}
        </Link>
    );
  };

  return (
    <div className="p-0 md:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button onClick={handlePrevMonth} size="sm" variant="outline" aria-label="Previous month">
            <ICONS.CHEVRON_LEFT className="w-5 h-5" />
          </Button>
          <Button onClick={handleNextMonth} size="sm" variant="outline" aria-label="Next month">
            <ICONS.CHEVRON_RIGHT className="w-5 h-5" />
          </Button>
          <Button onClick={handleToday} size="sm" variant="secondary">
            Today
          </Button>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-light-text dark:text-dark-text my-2 sm:my-0">
          {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-7 border-t border-l border-light-border dark:border-dark-border">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2 px-1 text-center text-xs md:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary border-r border-b border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-800/30">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-32 md:h-36 border-r border-b border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-800/20"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <div key={`day-${i + 1}`}>
            {renderCell(i + 1)}
          </div>
        ))}
         {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
          <div key={`empty-end-${i}`} className="h-32 md:h-36 border-r border-b border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-800/20"></div>
        ))}
      </div>
       <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-4 text-center">
        Daily P&L is shown in R-multiples. Price Action Logs are indicated by <span title="Price Action Logged"><ICONS.REVIEW_SYSTEM className="inline w-3 h-3 text-sky-500"/></span> icon. Click on a day to view trades for that date.
      </p>
    </div>
  );
};

export default CalendarPage;
