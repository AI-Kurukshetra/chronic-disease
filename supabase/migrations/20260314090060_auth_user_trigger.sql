-- Auto-create profile + patient on new auth user

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name TEXT;
  last_name TEXT;
BEGIN
  first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'New');
  last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', 'User');

  INSERT INTO public.profiles (id, role, first_name, last_name, timezone)
  VALUES (NEW.id, 'patient', first_name, last_name, 'UTC')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.patients (profile_id, primary_condition, risk_level)
  VALUES (NEW.id, 'type2_diabetes', 'medium')
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_handle_new_user ON auth.users;

CREATE TRIGGER trg_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
