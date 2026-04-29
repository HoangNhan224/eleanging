/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const DateTimeDisplay = ({ value, type, isDanger }: { value: string, type: string, isDanger: boolean }) => {
  return (
      <div className={isDanger ? 'countdown danger' : 'countdown'}>
        {value} {type}
      </div>
  )
}

export default DateTimeDisplay
