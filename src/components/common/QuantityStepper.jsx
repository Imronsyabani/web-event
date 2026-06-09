import { InputGroup, Button, Form } from 'react-bootstrap'

// Stepper jumlah: tombol − / nilai / +, di-clamp ke [min, max].
export default function QuantityStepper({ value = 0, onChange, min = 0, max }) {
  const clamp = (n) => {
    if (Number.isNaN(n)) n = min
    if (n < min) n = min
    if (max != null && n > max) n = max
    return n
  }
  const set = (n) => onChange?.(clamp(n))

  const atMin = value <= min
  const atMax = max != null && value >= max

  return (
    <InputGroup style={{ width: 130 }}>
      <Button
        variant="outline-secondary"
        onClick={() => set(value - 1)}
        disabled={atMin}
        aria-label="Kurangi"
      >
        <i className="bi bi-dash-lg" />
      </Button>
      <Form.Control
        className="text-center"
        inputMode="numeric"
        value={value}
        onChange={(e) => set(parseInt(e.target.value.replace(/\D/g, ''), 10))}
      />
      <Button
        variant="outline-secondary"
        onClick={() => set(value + 1)}
        disabled={atMax}
        aria-label="Tambah"
      >
        <i className="bi bi-plus-lg" />
      </Button>
    </InputGroup>
  )
}
