exports.up = function(knex) {
  return knex.schema
    .createTable('client_visits', function(table) {
      table.increments('id').primary();
      table.integer('employee_id').unsigned().notNullable();
      table.string('client_name', 255).notNullable();
      table.date('date').notNullable();
      table.datetime('check_in_time').notNullable();
      table.decimal('check_in_lat', 10, 8).notNullable();
      table.decimal('check_in_lng', 11, 8).notNullable();
      table.string('photo_in_url', 500).notNullable();
      table.datetime('check_out_time').nullable();
      table.decimal('check_out_lat', 10, 8).nullable();
      table.decimal('check_out_lng', 11, 8).nullable();
      table.string('photo_out_url', 500).nullable();
      table.decimal('distance_travelled', 10, 2).defaultTo(0);
      table.decimal('calculated_fee', 10, 2).defaultTo(0);
      table.enum('status', ['Active', 'Completed']).defaultTo('Active');
      table.timestamps(true, true);
    })
    .then(() => {
      // Add visit_id to LocationHistory to link tracking updates
      return knex.schema.hasColumn('LocationHistory', 'visit_id').then((exists) => {
        if (!exists) {
          return knex.schema.alterTable('LocationHistory', function(table) {
            table.integer('visit_id').unsigned().nullable();
          });
        }
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('LocationHistory', function(table) {
      table.dropColumn('visit_id');
    })
    .then(() => {
      return knex.schema.dropTableIfExists('client_visits');
    });
};
