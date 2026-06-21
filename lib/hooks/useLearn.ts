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
      setError(fetchError.message);
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
    if (error || !data) return null;
    return mapLearnArticle(data);
  }, []);

  const searchFaq = useCallback(async (query: string): Promise<FaqItem[]> => {
    if (!query.trim()) return [];
    
    // Simple ILIKE query on question/answer
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`);

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      keywords: row.keywords,
      category: row.category,
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
