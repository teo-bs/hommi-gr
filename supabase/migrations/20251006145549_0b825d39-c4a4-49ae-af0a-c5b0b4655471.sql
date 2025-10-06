-- Add unique constraint to prevent duplicate photos at same position
ALTER TABLE public.room_photos
ADD CONSTRAINT room_photos_room_id_sort_order_key 
UNIQUE (room_id, sort_order);

-- Add comment for clarity
COMMENT ON CONSTRAINT room_photos_room_id_sort_order_key ON public.room_photos IS
  'Ensures each room cannot have duplicate photos at the same sort position';