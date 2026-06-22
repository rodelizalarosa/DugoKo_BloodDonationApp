import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { LearnArticle, FaqItem } from '@/types';
import { mapLearnArticle } from '@/lib/mappers';

export function useLearn() {
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('learn_articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (fetchError) {
      // Treat permission-related failures as "no articles yet" so the app
      // can keep rendering instead of surfacing a blocking error overlay.
      if (fetchError.code === '42501' || fetchError.code === 'PGRST301' || fetchError.message.toLowerCase().includes('forbidden')) {
        setArticles([]);
      } else {
        setError(fetchError.message);
      }
    } else {
      setArticles((data ?? []).map(mapLearnArticle));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const fetchArticleById = useCallback(async (id: string): Promise<LearnArticle | null> => {
    const { data, error } = await supabase
      .from('learn_articles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    if (!data) return null;
    return mapLearnArticle(data);
  }, []);

  const searchFaq = useCallback(async (query: string): Promise<FaqItem[]> => {
    if (!query.trim()) return [];
    
    // Simple ILIKE query on question/answer
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`);

    if (error) return [];
    if (!data) return [];
    return data.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      keywords: row.keywords,
      category: row.category,
      sourceTitle: row.source_title ?? undefined,
      sourceUrl: row.source_url ?? undefined,
      lastVerifiedAt: row.last_verified_at ?? undefined,
      isActive: row.is_active,
    }));
  }, []);

  return {
    articles,
    isLoading,
    error,
    fetchArticleById,
    searchFaq,
    refresh: fetchArticles,
  };
}
