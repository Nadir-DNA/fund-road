
import React from "react";

interface FormContentProps {
  children: React.ReactNode;
  formData: any;
  handleFormChange: (field: string, value: any) => void;
  setFormData?: React.Dispatch<React.SetStateAction<any>>;
}

export default function FormContent({ 
  children, 
  formData, 
  handleFormChange,
  setFormData 
}: FormContentProps) {
  // Pass handleFormChange down to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        formData,
        onChange: handleFormChange,
        setFormData
      });
    }
    return child;
  });

  return childrenWithProps;
}
