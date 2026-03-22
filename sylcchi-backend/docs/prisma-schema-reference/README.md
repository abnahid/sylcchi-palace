# Feature-Based Prisma Source

Use this folder as the source of truth for schema editing by feature.

## Files

- `base.prisma`: generator and datasource blocks
- `enums.prisma`: shared enums
- `auth.prisma`: Role, User
- `room.prisma`: RoomType, Room, RoomImage
- `review.prisma`: Review, Wishlist
- `reservation.prisma`: Reservation, ReservationDocument, Checkin
- `payment.prisma`: Payment

## Workflow

1. Edit feature files in this folder.
2. Run `npm run prisma:build-schema`.
3. This generates `prisma/schema.prisma` automatically.
4. Run Prisma commands through scripts:
   - `npm run prisma:validate`
   - `npm run prisma:generate`
   - `npm run prisma:migrate:dev -- --name your_migration_name`

## Important

Do not manually edit `prisma/schema.prisma` for feature changes, because it is auto-generated from this folder.
