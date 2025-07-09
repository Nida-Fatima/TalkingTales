import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Story } from '../types';
import { SavedStory } from '../types/database';

interface CloudStoriesContextType {
  savedStories: Story[];
  loading: boolean;
  addStory: (story: Story) => Promise<void>;
  removeStory: (storyId: string) => Promise<void>;
  updateStory: (storyId: string, updates: Partial<Story>) => Promise<void>;
  syncWithLocal: (localStories: Story[]) => Promise<void>;
}

const CloudStoriesContext = createContext<CloudStoriesContextType | undefined>(undefined);

export function CloudStoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  // Load stories from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadStoriesFromCloud();
    } else {
      setSavedStories([]);
    }
  }, [user]);

  const loadStoriesFromCloud = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          console.warn('Saved stories table not found - using empty array');
          setSavedStories([]);
        } else {
          console.error('Error loading stories:', error);
        }
        return;
      }

      const stories: Story[] = data.map(transformCloudStoryToLocal);
      setSavedStories(stories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformCloudStoryToLocal = (cloudStory: SavedStory): Story => {
    return {
      id: cloudStory.id,
      title: cloudStory.title,
      language: { code: cloudStory.language, name: 'German', flag: '🇩🇪' },
      situation: { id: cloudStory.situation, title: cloudStory.situation, description: '' },
      dialogue: cloudStory.dialogue,
      createdAt: new Date(cloudStory.created_at),
      isSaved: true,
    };
  };

  const transformLocalStoryToCloud = (story: Story) => {
    return {
      id: story.id,
      title: story.title,
      situation: story.situation.title,
      language: story.language.code,
      dialogue: story.dialogue,
    };
  };

  const addStory = async (story: Story) => {
    if (!user) return;

    try {
      console.log('Attempting to save story:', story);
      const cloudStory = transformLocalStoryToCloud(story);
      console.log('Transformed story for cloud:', cloudStory);
      
      const { error } = await supabase
        .from('saved_stories')
        .insert({
          ...cloudStory,
          user_id: user.id,
        });

      if (error) {
        console.error('Error saving story:', error);
        throw error;
      }

      console.log('Story saved successfully');
      // Add the story with the saved flag set to true
      const savedStory = { ...story, isSaved: true };
      setSavedStories(prev => [savedStory, ...prev]);
    } catch (error) {
      console.error('Error saving story:', error);
      throw error;
    }
  };

  const removeStory = async (storyId: string) => {
    if (!user) return;

    try {
      console.log('Attempting to remove story:', storyId);
      const { error } = await supabase
        .from('saved_stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing story:', error);
        throw error;
      }

      console.log('Story removed successfully');
      setSavedStories(prev => prev.filter(s => s.id !== storyId));
    } catch (error) {
      console.error('Error removing story:', error);
      throw error;
    }
  };

  const updateStory = async (storyId: string, updates: Partial<Story>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_stories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating story:', error);
        return;
      }

      setSavedStories(prev => 
        prev.map(story => 
          story.id === storyId ? { ...story, ...updates } : story
        )
      );
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  const syncWithLocal = async (localStories: Story[]) => {
    if (!user) return;

    try {
      // Upload local stories that don't exist in cloud
      for (const story of localStories) {
        const exists = savedStories.find(s => s.id === story.id);
        if (!exists) {
          await addStory(story);
        }
      }
    } catch (error) {
      console.error('Error syncing with local:', error);
    }
  };

  return (
    <CloudStoriesContext.Provider value={{
      savedStories,
      loading,
      addStory,
      removeStory,
      updateStory,
      syncWithLocal,
    }}>
      {children}
    </CloudStoriesContext.Provider>
  );
}

export function useCloudStories() {
  const context = useContext(CloudStoriesContext);
  if (context === undefined) {
    throw new Error('useCloudStories must be used within a CloudStoriesProvider');
  }
  return context;
}