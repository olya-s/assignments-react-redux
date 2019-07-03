import React from 'react';
import logo from './logo.svg';
import './App.css';

class ControlledInput extends React.Component{
  constructor(props){
    super(props);

    this.state = {value: '', value2: '', valid: false};

    this.changeHandler = this.changeHandler.bind(this);
    this.changeHandler2 = this.changeHandler2.bind(this);
    this.validation = this.validation.bind(this);
  }

  changeHandler(e){
    const str = e.target.value;
    this.setState({value: str,
                  valid: (this.state.value2 === '') ? (str.length > 2) : this.validation(str, this.state.value2)
                });
  }

  changeHandler2(e){
    const str2 = e.target.value;
    this.setState({value2: str2,
                  valid: this.validation(this.state.value, str2)
                });
  }

  validation(v1, v2){
    return (v1 === v2);
  }

  render(){
    return(
      <div className="App">
        <input defaultValue={this.state.value}
              onChange={this.changeHandler}
              style={{backgroundColor: this.state.valid ? '' : '#FAA'}}
        />
        <input defaultValue={this.state.value2}
              onChange={this.changeHandler2}
              style={{backgroundColor: this.state.valid ? '' : '#FAA'}}
        />
      </div>
    )
  }
}

let CountrySelect = (props) => {
  let countries = props.countries;
  let countrySelect = [];
  for(let country in countries){
    countrySelect.push(<option value={country}>{country}</option>);
  }
    return(
      <select id="country" onChange={evt => props.onChange(evt.target.value)}>
        {countrySelect}
      </select>
    )
}

let CitySelect = ({cities}) => {
  let citySelect = [];
  cities.map(city => citySelect.push(<option value={city}>{city}</option>));
  return(
    <select id="city">
      {citySelect}
    </select>
  )
}

class App extends React.Component{
  constructor(props){
    super(props);

    this.state = {countries: {}, cities: []};
    this.getCities = this.getCities.bind(this);
  }

  componentDidMount(){
    fetch("https://raw.githubusercontent.com/David-Haim/CountriesToCitiesJSON/master/countriesToCities.json")
    .then(res => res.json())
    .then(data => {
      let first = Object.keys(data)[0];
      this.setState({countries: data,
                    cities: data[first]
                  });
      }
    )
  }

  getCities(country){
    this.setState({cities: this.state.countries[country]});
  }

  render(){
    return(
      <div className="App">
      <ControlledInput />
        <CountrySelect countries={this.state.countries} onChange={this.getCities}></CountrySelect>
        <CitySelect cities={this.state.cities}/>
      </div>
    )
  }
}

export default App;