create table car
(
    id      integer not null
        constraint car_pk
            primary key autoincrement,
    brand text not null,
    model text not null,
    color text not null,
    year  INTEGER CHECK (year BETWEEN 1900 AND 2100),
    additional_info text not null
);
