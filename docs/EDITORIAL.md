# Restaurant updates and photo permissions

Use the existing Supabase Table Editor; a separate admin application is unnecessary for 24 curated entries. Only the owner/editor should hold dashboard access. Public clients cannot edit restaurants.

For every change, verify the restaurant's official website and record the check date in `source_updated_at`. Check name, address, coordinates, website, operating status, cuisine and price. Avoid unverified live hours, dietary guarantees, ratings or travel-time claims. If uncertain or closed, set `is_published=false` while reviewing; preserve historical interaction records.

Before adding an image, keep a permission record with the restaurant ID, source page, author, exact licence/version, download date, proof of permission where relevant, permitted uses/expiry and any modifications. Restaurant websites and social posts are not automatically licensed for reuse. Never use a generated restaurant-specific image as documentary photography.

Set `image_url`, `image_credit` and `image_license_url` together; the database requires HTTPS URLs and attribution. First wire the credit/licence display into both clients, then publish photos. The current clients do not yet display photo attribution, so do not add attribution-required photos until that change is verified. Prefer owned or explicitly licensed assets hosted in controlled storage, not fragile hotlinks.

Review the full catalogue monthly and act promptly on correction/removal requests. Keep the support channel and responsible editor named in the operator's records. Feedback in `beta_feedback` can flag inaccuracies but is not evidence that a listing is correct.
