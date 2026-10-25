import "@typespec/http";
import "@typespec/openapi3";
import "@typespec/json-schema";

using Http;
using OpenAPI;
using JsonSchema;

@service(#{
  title: "Календарь звонков",
})
@server("http://localhost:3000", "Локальный сервер")
namespace Calendar;

// --- Типы событий ---

@jsonSchema
model EventType {
  id: string;
  name: string;
  description: string;
  duration: int32;
}

@jsonSchema
model EventTypeCreate {
  @minLength(1) name: string;
  description: string;
  @minValue(1) duration: int32;
}

// --- Слоты ---

@jsonSchema
model Slot {
  start: utcDateTime;
  end: utcDateTime;
  status: "free" | "occupied";
}

// --- Брони ---

@jsonSchema
model Booking {
  id: string;
  name: string;
  email: string;
  typeId: string;
  slotStart: utcDateTime;
  slotEnd: utcDateTime;
  createdAt: utcDateTime;
}

@jsonSchema
model BookingCreate {
  @minLength(1) name: string;
  @format("email") email: string;
  typeId: string;
  slotStart: utcDateTime;
}

// --- Эндпоинты ---

@route("/event-types")
namespace EventTypes {
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body types: EventType[];
  };

  @post
  op create(@body body: EventTypeCreate): {
    @statusCode statusCode: 201;
    @body type: EventType;
  };
}

@route("/slots")
namespace Slots {
  @get
  op list(
    @query typeId: string,
    @query from: utcDateTime,
    @query to: utcDateTime,
  ): {
    @statusCode statusCode: 200;
    @body slots: Slot[];
  };
}

@route("/bookings")
namespace Bookings {
  @post
  op create(@body body: BookingCreate): {
    @statusCode statusCode: 201;
    @body booking: Booking;
  } | {
    @statusCode statusCode: 409;
  };

  @get
  op list(): {
    @statusCode statusCode: 200;
    @body bookings: Booking[];
  };
}
