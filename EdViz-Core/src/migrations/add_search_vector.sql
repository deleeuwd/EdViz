CREATE OR REPLACE FUNCTION search_graphs(search_term TEXT)
RETURNS SETOF graphs AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM graphs
    WHERE title ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;