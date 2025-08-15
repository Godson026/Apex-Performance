
import React from 'react';
import { ConfidenceScore, EmotionalState, MarketEnvironment, ReasonForExit, RuleAdherenceScore, TradingSession, TradeManagementActionType, CorrelatedAssetBehavior, AccountCurrency, SourceType, OldNoteSourceType, UnderstandingLevel, SelfRatedConfidence, Bias, YesNoNeutral, EmotionDisciplineScore } from './types';


export const APP_NAME = "Apex Performance";

export const ICONS = {
  APP_LOGO_ICON: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="currentColor"> 
        {/* Stylized A shape with integrated chart elements. This is an approximation. */}
        {/* Left main part of A */}
        <path d="M78,25 L38,135 L58,135 L82,50 Q82,45 80,42 Z" />
        {/* Right main part of A */}
        <path d="M122,25 L162,135 L142,135 L118,50 Q118,45 120,42 Z" />
        
        {/* Chart line (simulating the crossbar and internal peak) */}
        <polyline points="70,85 85,95 100,70 115,80 130,90" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Candlestick 1 (left, integrated into A's form) */}
        <rect x="68" y="100" width="12" height="20" rx="2" ry="2"/> 
        <line x1="74" y1="92" x2="74" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/> 
        <line x1="74" y1="120" x2="74" y2="128" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>

        {/* Candlestick 2 (right, taller, integrated) */}
        <rect x="120" y="55" width="12" height="30" rx="2" ry="2"/>
        <line x1="126" y1="47" x2="126" y2="55" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <line x1="126" y1="85" x2="126" y2="93" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>

        {/* Text APEX - using Inter font if available via system/browser, otherwise sans-serif */}
        <text x="100" y="165" fontFamily="Inter, Arial, sans-serif" fontSize="28" fontWeight="bold" textAnchor="middle" fill="currentColor">APEX</text>
        {/* Text PERFORMANCE */}
        <text x="100" y="185" fontFamily="Inter, Arial, sans-serif" fontSize="14" textAnchor="middle" letterSpacing="1" fill="currentColor">PERFORMANCE</text>
      </g>
    </svg>
  ),
  ICON_A_STYLED: (props: React.SVGProps<SVGSVGElement>) => ( // Large stylized A for auth image panel
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 90 L40 10 L50 10 L50 30 L60 10 L90 90 L75 90 L65 60 L35 60 L25 90 Z" 
            stroke="currentColor" strokeWidth="3" fill="transparent" />
      <path d="M38 50 L62 50" stroke="currentColor" strokeWidth="3"/>
    </svg>
  ),
  EMAIL_FORM: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  LOCK_CLOSED_FORM: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  CHECK_SQUARE_FILLED: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="16" height="16" rx="4" fill="currentColor"/>
      <path d="M4 8L6.5 10.5L12 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  CHECK_SQUARE_EMPTY: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" stroke="currentColor"/>
    </svg>
  ),
  CHECK_CIRCLE: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  DASHBOARD: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  NEW_TRADE: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  ),
  TRADES_LIST: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
    </svg>
  ),
  ACCOUNTS: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  ),
  PLAYBOOKS: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-2.5v2.5h-3V11H10V4h4v7z" />
    </svg>
  ),
  LEARNING_HUB: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3L1 9l4 2.18v6.32L12 21l7-3.5V11.18L23 9 12 3zm0 2.31L19.58 9 12 12.08 4.42 9 12 5.31zM6 12.32l5 2.5v4.68l-5-2.5v-4.68zm12 0v4.68l-5 2.5v-4.68l5-2.5z" />
    </svg>
  ),
  // REVIEW_SYSTEM icon, now used for Price Action Log
  REVIEW_SYSTEM: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-3.352-2.126-6.322-5.064-7.484M19.5 12v3.75M4.5 12c0 3.352 2.126 6.322 5.064 7.484M4.5 12V8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" />
    </svg>
  ),
  INSIGHTS: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  CALENDAR: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Zm0 2.25h.008v.008H16.5v-.008Z" />
    </svg>
  ),
  SETTINGS: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42.12.64l2 3.46c.12.22.39.3.61.22l2.49 1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59-1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
    </svg>
  ),
  SUN: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  ),
  MOON: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.64-.11 2.4-.31-.3-.19-.58-.41-.84-.65-.63-.58-1.03-1.39-1.03-2.3C12.53 16.01 14.52 14 17 14c.91 0 1.72.39 2.3.03.25-.26.47-.54.66-.84.2-.76.31-1.57.31-2.4C21 7.03 16.97 3 12 3z" />
    </svg>
  ),
  MENU: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  CLOSE: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  PLUS_CIRCLE: (props: React.SVGProps<SVGSVGElement>) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  CHEVRON_DOWN: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
   CHEVRON_LEFT: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  ),
  CHEVRON_RIGHT: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  ),
  NOTE_ICON: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  ARROW_RIGHT: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  ),
   UPLOAD: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  ),
  LINK: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  SPARKLES: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  ),
  TRASH: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c-.34-.059-.68-.114-1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  ARROW_UP_TREND: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l3-3L21.75 12M21.75 12V4.5M21.75 12H12" />
    </svg>
  ),
  ARROW_DOWN_TREND: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l3 3L21.75 12M21.75 12V19.5M21.75 12H12" />
    </svg>
  ),
  TARGET_ICON: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-3.32m-8.12 2.08a6 6 0 0 1-7.38-5.84m4.8 5.84a14.98 14.98 0 0 0-3.32-6.16m2.08 8.12a6 6 0 0 1 5.84-7.38m-5.84 2.58a14.98 14.98 0 0 0-6.16 3.32m8.12-2.08a6 6 0 0 1 7.38 5.84m-4.8-5.84a14.98 14.98 0 0 0 3.32 6.16m-2.08-8.12a6 6 0 0 1-5.84 7.38V12m0 0a6 6 0 0 1-5.84-7.38M12 12a6 6 0 0 0-5.84 7.38" />
    </svg>
  ),
  SCALE_ICON: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47M12 4.5A48.416 48.416 0 0 1 18.75 4.97M12 4.5v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M12 20.25v-17.25M12 20.25c-1.472 0-2.882.265-4.185.75m5.653-15.75A2.625 2.625 0 1 1 9.347 5.11a2.625 2.625 0 0 1 6.306 0Zm1.88.884a2.625 2.625 0 1 0-5.25 0 2.625 2.625 0 0 0 5.25 0Z" />
    </svg>
  ),
  WARNING_ALT_ICON: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
    </svg>
  ),
  BOOK_OPEN: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  VIDEO_CAMERA: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    </svg>
  ),
  USER_CIRCLE: (props: React.SVGProps<SVGSVGElement>) => ( 
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  GLOBE_ALT: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  MICROPHONE: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5h0v-7.5m0 0H9M7.5 12.75h4.5m-4.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h4.5a3 3 0 0 1 3 3v2.25m6.75 1.5v-1.5a3 3 0 0 0-3-3h-4.5a3 3 0 0 0-3 3V12m0 0V11.25m0 0H12m0 0a3 3 0 0 1 0-6m0 6a3 3 0 0 0 0 6m0-6H12m6.75-6H12m6.75 6.75v-1.5m0 0h0" />
    </svg>
  ),
  LIGHTBULB: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  DOCUMENT_TEXT: (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  BRAIN: (props: React.SVGProps<SVGSVGElement>) => ( // New icon for Concepts
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15h3.75a2.25 2.25 0 002.25-2.25V9.375A2.25 2.25 0 0019.5 7.125h-3.75m-7.5 0H4.5A2.25 2.25 0 002.25 9.375v3.375c0 1.24 1.01 2.25 2.25 2.25h3.75m0-12.75V3.75A2.25 2.25 0 0112 1.5a2.25 2.25 0 012.25 2.25v.001M12 1.5a2.25 2.25 0 00-2.25 2.25V3.75m0 12.75v3.375c0 .62-.51 1.125-1.125 1.125A2.25 2.25 0 017.5 18.75v-3.375m0-12.75V3.75m0 12.75c0 .62.51 1.125 1.125 1.125A2.25 2.25 0 0013.5 18.75v-3.375m0-12.75V3.75m2.25 0v12.75m0 0v3.375a2.25 2.25 0 01-2.25 2.25 2.25 2.25 0 01-2.25-2.25v-3.375m2.25-12.75V3.75" />
    </svg>
  ),
  BOOKSTACK: (props: React.SVGProps<SVGSVGElement>) => ( // New icon for Sources
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75l-.623 2.25L2.25 7.5l3.877 1.5.623 2.25L7.5 15l3.877-1.5.623-2.25L15.877 9l.623-2.25L21.75 7.5l-3.877-1.5-.623-2.25L16.5 0 12 1.5 7.5 0 6.75 3.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-6M4.5 19.5v-15M19.5 4.5v15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V21m0-8.25L4.5 9.75M12 12.75L19.5 9.75M12 21l-7.5-3M12 21l7.5-3" />
    </svg>
  ),
  PIE_COLORS: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'],
  PIE_COLORS_ALT: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2D7DD2', '#F29E4C', '#D65DB1'],
};

export const TIME_RANGES = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year', 'All Time'];
export const ASSET_EXAMPLES = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'QQQ', 'BTC-USD', 'ETH-USD'];
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


export const CONFIDENCE_SCORES: ConfidenceScore[] = [1, 2, 3, 4, 5];
export const RULE_ADHERENCE_SCORES: RuleAdherenceScore[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const EMOTIONAL_STATE_OPTIONS: EmotionalState[] = Object.values(EmotionalState);
export const REASON_FOR_EXIT_OPTIONS: ReasonForExit[] = Object.values(ReasonForExit);
export const MARKET_ENVIRONMENT_OPTIONS: MarketEnvironment[] = Object.values(MarketEnvironment);
export const TRADING_SESSION_OPTIONS: TradingSession[] = Object.values(TradingSession);
export const TRADE_MANAGEMENT_ACTION_TYPE_OPTIONS: TradeManagementActionType[] = Object.values(TradeManagementActionType);
export const CORRELATED_ASSET_BEHAVIOR_OPTIONS: CorrelatedAssetBehavior[] = ['Confirming', 'Diverging', 'Neutral'];

// Used for the old Note structure in LearningHub, will be deprecated.
export const OLD_NOTE_SOURCE_TYPES_ARRAY: OldNoteSourceType[] = Object.values(OldNoteSourceType);

// New SourceTypes for Learning Hub V2
export const SOURCE_TYPES_ARRAY: SourceType[] = Object.values(SourceType);

// Learning Hub Tag Suggestions
export const PRE_SUGGESTED_TAGS = [
    { emoji: '💡', name: 'Insight' },
    { emoji: '📈', name: 'Strategy' },
    { emoji: '🧠', name: 'Psychology' },
    { emoji: '⚙️', name: 'Rule' },
    { emoji: '❓', name: 'Question' },
    { emoji: '🎯', name: 'Key Takeaway' },
    { emoji: '🚨', name: 'Warning' },
    { emoji: '🔗', name: 'Connection' },
];


export const ACCOUNT_CURRENCIES: AccountCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'BTC', 'ETH', 'USDT'];
// BROKER_EXAMPLES removed as it's no longer used.

// For Concept Management
export const UNDERSTANDING_LEVELS: UnderstandingLevel[] = ['Novice', 'Intermediate', 'Advanced', 'Expert'];
export const SELF_RATED_CONFIDENCE_SCORES: SelfRatedConfidence[] = [1, 2, 3, 4, 5];

// For Price Action Log
export const BIAS_OPTIONS: Bias[] = Object.values(Bias);
export const YES_NO_NEUTRAL_OPTIONS: YesNoNeutral[] = Object.values(YesNoNeutral);
// DAILY_LOG_CONFLUENCE_OPTIONS removed
export const EMOTION_DISCIPLINE_RATING_OPTIONS: EmotionDisciplineScore[] = [1, 2, 3, 4, 5];


export const getValueColorClasses = (
  value: number | string | undefined,
  positiveColor: string = 'text-success', // Tailwind class for theme's success color
  negativeColor: string = 'text-danger',   // Tailwind class for theme's danger color
  neutralColorLight: string = 'text-light-text',
  neutralColorDark: string = 'dark:text-dark-text'
): string => {
  if (value === undefined || value === null) {
    return `${neutralColorLight} ${neutralColorDark}`;
  }

  let numericValue: number | undefined = undefined;

  if (typeof value === 'number') {
    numericValue = value;
  } else if (typeof value === 'string') {
    const cleanedValue = value.replace(/[^0-9.-]+/g, ''); // Attempt to extract number (e.g., from "1.23R" or "$100")
    if (cleanedValue !== '') {
      const parsed = parseFloat(cleanedValue);
      if (!isNaN(parsed)) {
        numericValue = parsed;
      }
    }
  }

  if (numericValue !== undefined) {
    if (numericValue > 0.001) return positiveColor; // Apply positive color
    if (numericValue < -0.001) return negativeColor; // Apply negative color
  } else if (typeof value === 'string') {
    // Handle specific string cases if needed
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'win' || lowerValue === 'positive' || lowerValue === 'success' || lowerValue === 'good' || lowerValue === 'excellent') return positiveColor;
    if (lowerValue === 'loss' || lowerValue === 'negative' || lowerValue === 'danger' || lowerValue === 'bad') return negativeColor;
  }

  // Default for zero, non-numeric strings not matching keywords, or strings where number extraction failed
  return `${neutralColorLight} ${neutralColorDark}`;
};
