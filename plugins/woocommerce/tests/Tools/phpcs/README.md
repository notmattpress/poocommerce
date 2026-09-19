# Local PHPCS sniffs

Custom PHP_CodeSniffer sniffs for PooCommerce Core that are not part of the shared
[`poocommerce/poocommerce-sniffs`](https://github.com/poocommerce/poocommerce-sniffs)
package. They live here (rather than in `PooCommerce-Core`) so they can ship and evolve
with the codebase they guard.

The sniffs are registered by relative path in `plugins/poocommerce/phpcs.xml`, and this
directory is excluded from being linted as product source (sniff classes must be named
`XxxSniff.php`, which conflicts with the PooCommerce filename convention).

## `PooCommerceInternal.DB.IdentifierPlaceholder`

Flags the `%i` SQL identifier placeholder inside a `wpdb::prepare()` call when it is **not**
guarded by `wpdb::has_cap( 'identifier_placeholders' )` in the same function.

WordPress 6.2 added `%i` to `wpdb::prepare()` for quoting table/column names, but a `$wpdb`
drop-in can run on a supported WordPress version without implementing it (its
`has_cap( 'identifier_placeholders' )` returns `false`). On such a layer `prepare()` treats
`%i` as a literal and shifts the remaining positional arguments, silently producing malformed
queries.

**How to satisfy the sniff:**

- Preferred — interpolate the trusted identifier directly into the query string:

  ```php
  $table = OrdersTableDataStore::get_orders_table_name();
  // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- trusted table name.
  $wpdb->prepare( "SELECT id FROM {$table} WHERE customer_id = %d", $customer_id );
  ```

- When `%i` is genuinely required, guard it and provide a fallback:

  ```php
  if ( $wpdb->has_cap( 'identifier_placeholders' ) ) {
      $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $table, $id );
  }
  ```

The identifier MUST be a trusted, developer-provided value (a table or column name), never raw
user input.

### Verifying the sniff

The fixture `PooCommerceInternal/Tests/DB/IdentifierPlaceholderUnitTest.inc` documents the
flagged and allowed cases. Run the sniff over it directly:

```sh
cd plugins/poocommerce
bin/composer/phpcs/vendor/bin/phpcs -s \
  --standard=tests/Tools/phpcs/PooCommerceInternal/ruleset.xml \
  tests/Tools/phpcs/PooCommerceInternal/Tests/DB/IdentifierPlaceholderUnitTest.inc
```

Only the two unguarded `%i` cases (cases 1 and 2) should be reported.
