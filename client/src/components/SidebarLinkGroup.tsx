/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import React, { useState, ReactNode } from 'react'

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode
  activecondition: boolean
}

/**
 * SidebarLinkGroup component manages the open/close state of a group of sidebar links.
 *
 * @author Hien
 * @component
 * @param {SidebarLinkGroupProps} props - The props for the component.
 * @returns {JSX.Element} The rendered SidebarLinkGroup component.
 *
 * @property {function} children - A function that renders the children components.
 * @property {boolean} activecondition - The condition to determine if the group is active.
 */
function SidebarLinkGroup ({
  children,
  activecondition
}: SidebarLinkGroupProps) {
  const [open, setOpen] = useState(activecondition)
  // Toggles the open/close state of the group.
  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${activecondition && 'bg-teal-300'}`}>
      {children(handleClick, open)}
    </li>
  )
}

export default SidebarLinkGroup
