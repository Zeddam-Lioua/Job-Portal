import React, { useState } from "react";
import { InputGroup, Form } from "react-bootstrap";
import Select from "react-select";
import djezzyLogo from "../../assets/carriers/djezzy.png";
import ooredooLogo from "../../assets/carriers/ooredoo.png";
import mobilisLogo from "../../assets/carriers/mobilis.png";

const CARRIERS = [
  {
    prefix: "07",
    name: "Djezzy",
    logo: djezzyLogo,
    dimensions: {
      width: 32,
      marginRight: 12,
    },
  },
  {
    prefix: "05",
    name: "Ooredoo",
    logo: ooredooLogo,
    dimensions: {
      width: 36,
      marginRight: 12,
    },
  },
  {
    prefix: "06",
    name: "Mobilis",
    logo: mobilisLogo,
    dimensions: {
      width: 36,
      marginRight: 12,
    },
  },
];

const PhoneInput = ({ value, onChange, required }) => {
  const [carrier, setCarrier] = useState("07");
  const [number, setNumber] = useState("");

  const options = CARRIERS.map((c) => ({
    value: c.prefix,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={c.logo}
          alt={c.name}
          style={{
            width: c.dimensions.width,
            marginRight: c.dimensions.marginRight,
            objectFit: "contain",
          }}
        />
        {c.name}
      </div>
    ),
  }));

  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{2})(?=\d)/g, "$1 ");
  };

  const handleCarrierChange = (selected) => {
    setCarrier(selected.value);
    onChange({
      target: {
        name: "phone",
        value: `${selected.value}${number}`, // Format without +213
      },
    });
  };

  const handleNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 8) {
      setNumber(val);
      const formattedNumber = `${carrier}${val}`; // Store without +213
      onChange({
        target: {
          name: "phone",
          value: formattedNumber,
        },
      });
    }
  };

  const getCurrentCarrierDisplay = () => {
    const currentCarrier = CARRIERS.find((c) => c.prefix === carrier);
    return currentCarrier ? currentCarrier.prefix : "";
  };

  return (
    <InputGroup>
      <Select
        value={options.find((opt) => opt.value === carrier)}
        onChange={handleCarrierChange}
        options={options}
        required={required}
        isSearchable={false}
        styles={{
          container: (base) => ({
            ...base,
            width: 180,
            minWidth: "fit-content",
          }),
          menuList: (base) => ({
            ...base,
            width: "100%",
            minWidth: 180,
          }),
          control: (base) => ({
            ...base,
            height: "38px",
            minHeight: "38px",
            paddingLeft: "2px",
            cursor: "pointer",
          }),
          option: (base) => ({
            ...base,
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            whiteSpace: "nowrap",
          }),
          dropdownIndicator: (base) => ({
            ...base,
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:before": {
              content: `'${getCurrentCarrierDisplay()}'`,
              color: "#666",
              position: "absolute",
            },
          }),
          indicatorSeparator: (base) => ({
            ...base,
            margin: "8px 0",
          }),
        }}
        components={{
          DropdownIndicator: ({ innerProps }) => (
            <div
              {...innerProps}
              style={{
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getCurrentCarrierDisplay()}
            </div>
          ),
        }}
      />
      <Form.Control
        type="text"
        value={formatPhoneNumber(number)}
        onChange={handleNumberChange}
        placeholder="Enter 8 digits"
        required={required}
        maxLength={11} // Adjusted for spaces
        style={{ height: "38px" }}
      />
    </InputGroup>
  );
};

export default PhoneInput;
