import React, { useState } from 'react';
import { SolidCard, SolidCardHeader, SolidCardTitle, SolidCardContent } from '../../ui/solid-card';
import { SolidButton } from '../../ui/solid-button';
import { SolidBadge } from '../../ui/solid-badge';
import { userJourneys, type UserJourney } from '../../../data/user-journeys';
import { cn } from "@/lib/utils";
import {
  Users as UserGroupIcon,
  BarChart,
  Clock as ClockIcon,
  DollarSign as CurrencyDollarIcon,
  ArrowRight,
  AlertTriangle as ExclamationTriangleIcon,
  Lightbulb as LightBulbIcon,
  Heart as HeartIcon
} from 'lucide-react';

interface UserJourneyVisualizationProps {
  className?: string;
}

export function UserJourneyVisualization({ className }: UserJourneyVisualizationProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>(userJourneys[0].persona);
  
  const currentJourney = userJourneys.find(journey => journey.persona === selectedPersona);
  
  if (!currentJourney) return null;

  const getEmotionColor = (emotion: string) => {
    const emotionMap: Record<string, string> = {
      'Frustrated': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'Overwhelmed': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'Skeptical': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'Interested': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'Cautious': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'Hopeful': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'Confident': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      'Engaged': 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
      'Decisive': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
      'Excited': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
      'Ready': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
    };
    return emotionMap[emotion] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <SolidBadge variant="secondary" className="mb-4">
          <UserGroupIcon className="w-3 h-3 mr-1" />
          User Journey Analysis
        </SolidBadge>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Revenue Operations Personas
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Detailed journey mapping for conversion optimization and targeted messaging
        </p>
      </div>

      {/* Persona Selection */}
      <SolidCard className="mb-8">
        <SolidCardHeader>
          <SolidCardTitle>Select Persona</SolidCardTitle>
        </SolidCardHeader>
        <SolidCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {userJourneys.map((journey) => (
              <SolidButton
                key={journey.persona}
                variant={selectedPersona === journey.persona ? "default" : "outline"}
                className="h-auto p-4 text-left"
                onClick={() => setSelectedPersona(journey.persona)}
              >
                <div className="font-semibold text-sm">{journey.persona}</div>
                <div className="text-xs opacity-70 mt-1">
                  {journey.persona.includes('SaaS') && '$2M-$50M ARR'}
                  {journey.persona.includes('E-commerce') && '$10M+ GMV'}
                  {journey.persona.includes('Professional') && '$5M+ Revenue'}
                  {journey.persona.includes('General') && 'All Industries'}
                </div>
              </SolidButton>
            ))}
          </div>
        </SolidCardContent>
      </SolidCard>

      {/* Persona Overview */}
      <SolidCard className="mb-8">
        <SolidCardHeader>
          <SolidCardTitle className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            {currentJourney.persona} Overview
          </SolidCardTitle>
        </SolidCardHeader>
        <SolidCardContent className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            {currentJourney.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pain Points */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Key Pain Points
              </h4>
              <ul className="space-y-2">
                {currentJourney.painPoints.map((pain, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {pain}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Goal State */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                <LightBulbIcon className="w-4 h-4" />
                Desired Outcome
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentJourney.goalState}
              </p>
            </div>
          </div>
        </SolidCardContent>
      </SolidCard>

      {/* Journey Stages */}
      <div className="space-y-6 mb-8">
        {currentJourney.journeyStages.map((stage, index) => (
          <SolidCard key={index}>
            <SolidCardHeader>
              <SolidCardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                  {index + 1}
                </div>
                {stage.stage}
                <SolidBadge variant="outline" className="ml-auto">
                  {stage.touchpoint}
                </SolidBadge>
              </SolidCardTitle>
            </SolidCardHeader>
            <SolidCardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* User Actions */}
                <div>
                  <h5 className="font-semibold mb-2 text-blue-600 dark:text-blue-400 text-sm">
                    User Actions
                  </h5>
                  <ul className="space-y-1">
                    {stage.userActions.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Emotions */}
                <div>
                  <h5 className="font-semibold mb-2 text-purple-600 dark:text-purple-400 text-sm">
                    Emotional State
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {stage.emotions.map((emotion, emotionIndex) => (
                      <SolidBadge
                        key={emotionIndex}
                        variant="outline"
                        className={cn("text-xs", getEmotionColor(emotion))}
                      >
                        <HeartIcon className="w-2 h-2 mr-1" />
                        {emotion}
                      </SolidBadge>
                    ))}
                  </div>
                </div>
                
                {/* Barriers */}
                <div>
                  <h5 className="font-semibold mb-2 text-red-600 dark:text-red-400 text-sm">
                    Barriers
                  </h5>
                  <ul className="space-y-1">
                    {stage.barriers.map((barrier, barrierIndex) => (
                      <li key={barrierIndex} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                        <ExclamationTriangleIcon className="w-3 h-3 mt-0.5 text-red-500 flex-shrink-0" />
                        {barrier}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Opportunities */}
                <div>
                  <h5 className="font-semibold mb-2 text-green-600 dark:text-green-400 text-sm">
                    Opportunities
                  </h5>
                  <ul className="space-y-1">
                    {stage.opportunities.map((opportunity, oppIndex) => (
                      <li key={oppIndex} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                        <LightBulbIcon className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SolidCardContent>
          </SolidCard>
        ))}
      </div>

      {/* Conversion Triggers & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SolidCard>
          <SolidCardHeader>
            <SolidCardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Conversion Triggers
            </SolidCardTitle>
          </SolidCardHeader>
          <SolidCardContent>
            <ul className="space-y-2">
              {currentJourney.conversionTriggers.map((trigger, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {trigger}
                </li>
              ))}
            </ul>
          </SolidCardContent>
        </SolidCard>
        
        <SolidCard>
          <SolidCardHeader>
            <SolidCardTitle className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5" />
              Key Metrics
            </SolidCardTitle>
          </SolidCardHeader>
          <SolidCardContent>
            <ul className="space-y-2">
              {currentJourney.keyMetrics.map((metric, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">📊</span>
                  {metric}
                </li>
              ))}
            </ul>
          </SolidCardContent>
        </SolidCard>
      </div>
    </div>
  );
}