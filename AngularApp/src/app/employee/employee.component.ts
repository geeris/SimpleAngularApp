import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { GoogleChartInterface, GoogleChartType } from 'ng2-google-charts';

export class Employee{
  constructor(public Id: string, public EmployeeName: string, public StarTimeUtc: string, public EndTimeUtc: string){}
}
interface EmployeeObject{
  name: string;
  monthlyWorkingHours: number;
}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  employees: EmployeeObject[] = [];
  employeeToWorkingHoursMap = new Map<string, number>();

  pieChart: GoogleChartInterface = {
    chartType: GoogleChartType.PieChart,
    dataTable: [
    ],
    options: { 'title': 'Employees total time worked' },
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
      this.getEmployees();
  }

  private addDataToPieChart(){
    this.pieChart.dataTable.push(['Employee', 'Hours']);

    for(let one of this.employeeToWorkingHoursMap)
    {
      if(one[0] != undefined)
      this.pieChart.dataTable.push([one[0], one[1]]);
    }
  }

  private getEmployees(){
    this.http.get<Array<Employee>>('https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==')
    .subscribe({
         next: response => 
         {
            this.getEmployeeToWorkingHoursMap(response);
            console.log(this.employeeToWorkingHoursMap);
         },
         error: err => console.log(err)
       }
    )
    // .subscribe(response => { this.employees = response})
  }

  private getEmployeeToWorkingHoursMap(response: Employee[]){
    for(let one of response){
        if(this.employeeToWorkingHoursMap.has(one.EmployeeName))
        //checking if key exists
        {
          let oldValue = this.employeeToWorkingHoursMap.get(one.EmployeeName)
              if(oldValue != undefined)
              {
                  let newValue = this.getHoursDiff(new Date(one.StarTimeUtc), new Date(one.EndTimeUtc))

                  this.employeeToWorkingHoursMap.delete(one.EmployeeName)
                  this.employeeToWorkingHoursMap.set(one.EmployeeName, (oldValue+newValue))
              }
        }
        else{
            this.employeeToWorkingHoursMap.set(one.EmployeeName, this.getHoursDiff(new Date(one.StarTimeUtc), new Date(one.EndTimeUtc)));
        }
    }
        this.fillEmployeesArrayWithDataFromMap(this.employeeToWorkingHoursMap) 
        this.addDataToPieChart();
  }

  private getHoursDiff(startDate: Date, endDate: Date):number {
      const msInHour = 1000 * 60 * 60;
      //console.log(startDate);
      //console.log(endDate);
      return Math.round(
          Math.abs(endDate.getTime() - startDate.getTime()) / msInHour,
      );
  }
  
  private fillEmployeesArrayWithDataFromMap(employees: Map<string, number>){
    for(let employee of employees)
    {
      let temp: EmployeeObject = {
        monthlyWorkingHours: employee[1],
        name:employee[0]
      }
      this.employees.push(temp)
    }
    this.sortArrayOfObjects(this.employees)
  }
  
  private sortArrayOfObjects(employees: EmployeeObject[]){
    this.employees.sort((a, b) => b.monthlyWorkingHours - a.monthlyWorkingHours)
  }
}


