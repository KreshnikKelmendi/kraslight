import { createSupabaseServerClient } from './server';
import { sliderRowToDoc } from './row-map';

export async function findActiveSlider() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('sliders')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data ? sliderRowToDoc(data) : null;
}

export async function createActiveSlider(slides: unknown[]) {
  const supabase = createSupabaseServerClient();

  await supabase.from('sliders').update({ is_active: false }).eq('is_active', true);

  const { data, error } = await supabase
    .from('sliders')
    .insert({ slides, is_active: true })
    .select('*')
    .single();
  if (error) throw error;
  return sliderRowToDoc(data);
}
