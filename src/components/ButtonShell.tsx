import type {ButtonHTMLAttributes, ReactNode} from 'react'

type ButtonShellProps = {
    children: ReactNode
    shellClassName?: string
    buttonClassName?: string
    onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onClick' | 'children'>

export function ButtonShell({
                                children,
                                shellClassName,
                                buttonClassName,
                                onClick,
                                type = 'button',
                                ...buttonProps
                            }: ButtonShellProps) {
    const shellClasses = ['button-shell', shellClassName].filter(Boolean).join(' ')

    return (
        <span className={shellClasses}>
      <button
          type={type}
          onClick={onClick}
          className={buttonClassName}
          {...buttonProps}
      >
        {children}
      </button>
    </span>
    )
}