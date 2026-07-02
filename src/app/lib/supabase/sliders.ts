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

/** Update the active slider in place, or create one if none exists. */
export async function saveActiveSliderSlides(slides: unknown[]) {
  const supabase = createSupabaseServerClient();
  const existing = await findActiveSlider();

  if (existing?.id) {
    const { data, error } = await supabase
      .from('sliders')
      .update({ slides, is_active: true })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return sliderRowToDoc(data);
  }

  const { data, error } = await supabase
    .from('sliders')
    .insert({ slides, is_active: true })
    .select('*')
    .single();
  if (error) throw error;
  return sliderRowToDoc(data);
}
