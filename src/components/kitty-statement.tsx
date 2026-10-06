export function PaidMark({ paid }: { paid: boolean }) {
  return (
    <span className={paid ? "ml-2 inline-flex items-center bg-[#e7f6ec] px-2 py-0.5 text-xs font-medium text-[#1f7a3a]" : "ml-2 inline-flex items-center bg-[#fdeceb] px-2 py-0.5 text-xs font-medium text-[#b42318]"}>
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

export function KittyStatement({
  circle,
  onPaid,
}: {
  circle: {
    name: string;
    each: number;
    opening: number;
    kitty: number;
    members: { id: string; name: string; paid: boolean }[];
    bills: { id: string; note: string; amount: number; balance: number; bill: string }[];
  };
  onPaid?: (coupleId: string) => void;
}) {
  const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
  return (
    <div>
      <p className="mt-8 text-xs tracking-index text-muted uppercase">{circle.name}</p>
      <p className="mt-3 text-5xl font-semibold tracking-tight text-fg">{money(circle.kitty)}</p>
      <p className="mt-2 text-sm text-pretty text-muted">
        Balance · {circle.members.length} couples × {money(Number(circle.each))} at the start of the cycle · {circle.members.length} months
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {circle.members.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="text-fg">{member.name}</span>
            <span className="flex items-center gap-4">
              <PaidMark paid={member.paid} />
              {onPaid && !member.paid ? (
                <button type="button" className="h-11" onClick={() => onPaid(member.id)}>
                  Mark paid
                </button>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">Opening {money(circle.opening)}</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {circle.bills.length === 0 ? <li className="py-3 text-sm text-muted">No bills yet.</li> : null}
        {circle.bills.map((bill) => (
          <li key={bill.id} className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="flex items-center gap-3 text-fg">
              {bill.bill ? <img src={bill.bill} alt="" className="size-12 object-cover" /> : null}
              {bill.note}
              <span className="text-muted">− {money(bill.amount)}</span>
            </span>
            <span className="text-fg">{money(bill.balance)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
