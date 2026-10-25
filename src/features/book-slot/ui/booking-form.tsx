import { useState, type FormEvent } from 'react';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { createBooking, type Booking } from '../../../entities/booking';
import type { Slot } from '../../../entities/slot';
import { ApiError } from '../../../shared/api';

interface FormErrors {
  name?: string;
  email?: string;
}

function validate(name: string, email: string): FormErrors {
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = 'Укажите имя';
  }

  if (!email.trim()) {
    errors.email = 'Укажите email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Некорректный email';
  }

  return errors;
}

interface BookingFormProps {
  typeId: string;
  slot: Slot;
  onBooked: (booking: Booking) => void;
  onConflict: () => void;
  onBack: () => void;
}

export function BookingForm({ typeId, slot, onBooked, onConflict, onBack }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(name, email);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createBooking({
        name: name.trim(),
        email: email.trim(),
        typeId,
        slotStart: slot.start,
      });
      onBooked(booking);
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError && error.status === 409) {
        onConflict();
      } else {
        setSubmitError('Не удалось создать бронь, попробуйте ещё раз');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack>
        <TextInput
          label="Имя"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          error={errors.name}
        />
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          error={errors.email}
        />
        {submitError && <Text c="red">{submitError}</Text>}
        <Group>
          <Button variant="subtle" onClick={onBack} disabled={submitting}>
            Назад
          </Button>
          <Button type="submit" loading={submitting}>
            Записаться
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
