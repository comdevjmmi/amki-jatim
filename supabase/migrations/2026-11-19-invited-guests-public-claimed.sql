-- Show every invited guest in the /register search, including ones who have
-- already registered, so the form can say "sudah selesai registrasi" instead
-- of silently hiding them. Only is_claimed (boolean) is added; contact and
-- claimed_at stay private.
create or replace view invited_guests_public as
  select id, full_name, campus_name, title, is_claimed
  from invited_guests;

grant select on invited_guests_public to anon, authenticated;
