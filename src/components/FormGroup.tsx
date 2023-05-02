export const FormGroup = (props: React.ComponentPropsWithoutRef<"div">) => (
    <div className='flex flex-col gap-1' {...props}>
        {props.children}
    </div>
)
