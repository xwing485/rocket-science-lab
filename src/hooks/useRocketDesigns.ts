
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RocketDesign {
  id?: string;
  name: string;
  description?: string;
  nose_cone: any;
  body_tube: any;
  fins: any;
  engine: any;
  performance_stats: any;
  created_at?: string;
  updated_at?: string;
}

export const useRocketDesigns = () => {
  const [designs, setDesigns] = useState<RocketDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your saved designs.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('rocket_designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast({
        title: "Error",
        description: "Failed to load rocket designs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDesign = async (design: Omit<RocketDesign, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your design.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('rocket_designs')
        .insert([{ ...design, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rocket design "${design.name}" saved successfully!`,
      });

      await fetchDesigns();
      return data;
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: "Error",
        description: "Failed to save rocket design.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateDesign = async (id: string, updates: Partial<RocketDesign>) => {
    try {
      const { data, error } = await supabase
        .from('rocket_designs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rocket design updated successfully!",
      });

      await fetchDesigns();
      return data;
    } catch (error) {
      console.error('Error updating design:', error);
      toast({
        title: "Error",
        description: "Failed to update rocket design.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteDesign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rocket_designs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rocket design deleted successfully!",
      });

      await fetchDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
      toast({
        title: "Error",
        description: "Failed to delete rocket design.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  return {
    designs,
    loading,
    saveDesign,
    updateDesign,
    deleteDesign,
    fetchDesigns,
  };
};
