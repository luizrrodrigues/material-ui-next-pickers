import * as React from 'react'
import SwipeableViews from 'react-swipeable-views'
import {virtualize} from 'react-swipeable-views-utils'
import * as classnames from 'classnames'
import {withStyles, Theme, StyledComponentProps, StyleRules} from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import {ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon} from '@material-ui/icons'

import * as DateUtil from './date'
const VirtualizedSwipeableViews = virtualize(SwipeableViews)

const styles = (theme:Theme):StyleRules => ({
  calendarContainer: {
    width: (48 * 7) + 'px'
  },
  calendarDialog: {
    position: 'relative',
    maxWidth: 'calc(100vw - 64px)',
    overflow: 'hidden'
  },
  calendarControl: {
    position: 'absolute',
    width: '100%',
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100
  },
  calendarControlButton: {
    pointerEvents: 'all'
  },
  calendarControlMonth: {
    display: 'flex',
    height: '48px',
    justifyContent: 'center',
    alignItems: 'center'
  },
  calendarMonthTitle: {
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none'
  },
  years: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  invalidInput: {
    color: theme.palette.text.disabled
  },
  week: {
    display: 'flex'
  },
  labelWeekDay: {
    height: '48px',
    width: '48px',
    color: theme.palette.text.hint,
    fontWeight: 300,
    lineHeight: '48px',
    textAlign: 'center'
  },
  weekDay: {
    flex: '1 1 auto',
    height: '38px',
    width: '38px',
    margin: '5px'
  },
  weekDayResponse: {
    maxHeight: 'calc(((100vw - 64px) / 7) - 10px)'
  },
  selectedDay: {
    backgroundColor: theme.palette.primary.dark
  },
  selectedDayText: {
    color: theme.palette.primary.contrastText
  }
})
@(withStyles as any)(styles)
class Calendar extends React.Component<CalendarProps, CalendarState> {
  updateHeight = {
    month: undefined as () => void,
    year: undefined as () => void
  }
  constructor(props) {
    super(props)
    const now = new Date()
    var date = new Date(now.getTime())
    const {min, max} = props
    if(max && now.getTime() > max.getTime()) {
      date = new Date(max.getTime())
    } else if(min && now.getTime() < min.getTime()) {
      date = new Date(min.getTime())
    }
    this.state = {
      mode: 'month',
      month: date.getMonth(),
      year: date.getFullYear(),
      yearIndex: Math.floor(date.getFullYear() / 18)
    }
  }
  componentDidMount() {
    window.addEventListener('resize', this.resize)
    const {value} = this.props
    if(value) {
      this.setState({
        month: value.getMonth(),
        year: value.getFullYear()
      })
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }
  resize = () => {
    if(this.updateHeight.month) {
      this.updateHeight.month()
    }
    if(this.updateHeight.year) {
      this.updateHeight.year()
    }
  }
  selectDate = (date:Date) => {
    this.props.closeCalendar()
    this.props.onChange(date)
  }
  showYearsCalendar = () => {
    const {year} = this.state
    this.setState({
      mode: 'year',
      yearIndex: Math.floor(year / 18)
    })
  }
  selectCalendarYear = (year?:number) => {
    const {min, max} = this.props
    const {month} = this.state
    if(year) {
      this.setState({
        mode: 'month',
        year,
        month: min && month < min.getMonth() && year === min.getFullYear()? min.getMonth():(
          max && month > max.getMonth() && year === max.getFullYear()? max.getMonth():month
        )
      })
    } else {
      this.setState({
        mode: 'month'
      })
    }
  }
  previousYearsValid = () => {
    const {min} = this.props
    const {yearIndex} = this.state
    return yearIndex >= 1 && (min === undefined || yearIndex >= Math.ceil(min.getFullYear() / 18))
  }
  previousYears = () => {
    const {min} = this.props
    const {yearIndex} = this.state
    this.setState({
      yearIndex: yearIndex - 1
    })
  }
  nextYearsValid = () => {
    const {max} = this.props
    const {yearIndex} = this.state
    return max === undefined || yearIndex < Math.floor(max.getFullYear() / 18)
  }
  nextYears = () => {
    const {yearIndex} = this.state
    this.setState({
      yearIndex: yearIndex + 1
    })
  }
  changeYears = (index) => {
    this.setState({
      yearIndex: index
    })
  }
  yearInvalid = (currentYear:number) => {
    const {min, max} = this.props
    const {month, year} = this.state
    return (min && currentYear < min.getFullYear()) || (max && currentYear > max.getFullYear()) || year === currentYear
  }
  previousMonthValid = () => {
    const {min} = this.props
    const {month, year} = this.state
    return min === undefined || (month > min.getMonth() || year > min.getFullYear())
  }
  previousMonth = () => {
    const {month, year} = this.state
    this.setState({
      year: year - (month <= 0? 1:0),
      month: month <= 0? 11:month - 1
    })
  }
  nextMonthValid = () => {
    const {max} = this.props
    const {month, year} = this.state
    return max === undefined || (month < max.getMonth() || year < max.getFullYear())
  }
  nextMonth = () => {
    const {month, year} = this.state
    this.setState({
      year: year + (month >= 11? 1:0),
      month: month >= 11? 0:month + 1
    })
  }
  changeMonth = (index) => {
    this.setState({
      year: Math.floor(index / 12),
      month: index % 12
    })
  }
  dayInvalid = (date:Date) => {
    const {value, min, max} = this.props
    return (value && DateUtil.sameDay(date, value)) || (min && date.getTime() < min.setHours(0, 0, 0, 0) || (max && date.getTime() > max.setHours(0, 0, 0, 0)))
  }
  yearIndexValid = (index:number) => {
    const {yearIndex} = this.state
    return index <= yearIndex + 2 && index >= yearIndex - 2
  }
  monthIndexValid = (index:number) => {
    const {month, year} = this.state
    const currentIndex = year * 12 + month
    return index <= currentIndex + 2 && index >= currentIndex - 2
  }
  generateYearCalendar = (index:number) => {
    const years:number[][] = []
    var counter = 0
    for(var year = index * 18; year < (index + 1) * 18; year++) {
      if(!years[Math.floor(counter / 3)]) {
        years[Math.floor(counter / 3)] = [year]
      } else {
        years[Math.floor(counter / 3)] = [...years[Math.floor(counter / 3)], year]
      }
      counter++
    }
    return years
  }
  generateMonthCalendar = (index:number) => {
    const calendarFocus = {
      year: Math.floor(index / 12),
      month: index % 12
    }
    const firstDay = new Date(calendarFocus.year, calendarFocus.month, 1)
    const daysInWeekInMonth:Date[][] = [Array.apply(undefined, {length:firstDay.getDay()})]
    var counter = firstDay.getDay()
    for(let day = firstDay; day.getMonth() === calendarFocus.month; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
      if(!daysInWeekInMonth[Math.floor(counter / 7)]) {
        daysInWeekInMonth[Math.floor(counter / 7)] = [new Date(day.getFullYear(), day.getMonth(), day.getDate())]
      } else {
        daysInWeekInMonth[Math.floor(counter / 7)] = [...daysInWeekInMonth[Math.floor(counter / 7)], new Date(day.getFullYear(), day.getMonth(), day.getDate())]
      }
      counter++
    }
    for(let day = 6; !daysInWeekInMonth[daysInWeekInMonth.length - 1][day]; day--) {
      daysInWeekInMonth[daysInWeekInMonth.length - 1][day] = undefined
    }
    return daysInWeekInMonth
  }
  render() {
    const {classes, value, dialog} = this.props
    const {mode, year, month, yearIndex} = this.state
    return (<div>
      {mode === 'month'? [
        <div className={classes.calendarControl} key='calendar-month-control'>
          <IconButton classes={{root:classes.calendarControlButton}} disabled={!this.previousMonthValid()} onClick={this.previousMonth}><ChevronLeftIcon/></IconButton>
          <IconButton classes={{root:classes.calendarControlButton}} disabled={!this.nextMonthValid()} onClick={this.nextMonth}><ChevronRightIcon/></IconButton>
        </div>,
        <VirtualizedSwipeableViews key='calendar-month-swipeable'
          action={actions => this.updateHeight.year = actions.updateHeight}
          className={classnames(classes.calendarContainer, {[classes.calendarDialog]:dialog})}
          index={year * 12 + month} animateHeight onChangeIndex={this.changeMonth}
          slideRenderer={({index}) =>
            this.monthIndexValid(index) && <div key={index} className={classnames(classes.calendarContainer, {[classes.calendarDialog]:dialog})}>
              <div className={classes.calendarControlMonth}>
                <Button onClick={this.showYearsCalendar} classes={{root:classes.calendarMonthTitle}}>
                  {DateUtil.month[index % 12].long + ', ' + Math.floor(index / 12)}
                </Button>
              </div>
              <div className={classes.week}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) =>
                  <Typography key={'weeklabel-' + index} className={classes.labelWeekDay} variant='body1'>{day}</Typography>
                )}
              </div>
              {this.generateMonthCalendar(index).map((week, index) =>
                <div className={classnames(classes.week, {[classes.calendarDialog]:dialog})} key={'week-' + index}>
                  {week.map((date, index) =>
                    date? <IconButton classes={{root:classnames({[classes.selectedDay]:value && DateUtil.sameDay(date, value), [classes.weekDayResponse]:dialog}, classes.weekDay)}} disabled={this.dayInvalid(date)} onClick={() => this.selectDate(date)} key={'day-' + index}>
                      <Typography classes={{root:classnames({[classes.selectedDayText]:value && DateUtil.sameDay(date, value), [classes.invalidInput]:this.dayInvalid(date)})}} variant='body1'>{date.getDate()}</Typography>
                    </IconButton> : 
                    <div className={classnames(classes.weekDay, {[classes.weekDayResponse]:dialog})} key={'day-' + index}/>
                  )}
                </div>
              )}
            </div>
          }
        />
      ] :
      mode === 'year'? [
        <div className={classes.calendarControl} key='calendar-year-control'>
          <IconButton disabled={!this.previousYearsValid()} onClick={this.previousYears}><ChevronLeftIcon/></IconButton>
          <IconButton disabled={!this.nextYearsValid()} onClick={this.nextYears}><ChevronRightIcon/></IconButton>
        </div>,
        <VirtualizedSwipeableViews key='calendar-year-swipeable'
          action={actions => this.updateHeight.year = actions.updateHeight}
          className={classnames(classes.calendarContainer, {[classes.calendarDialog]:dialog})}
          index={yearIndex} animateHeight onChangeIndex={this.changeYears}
          slideRenderer={({index}) =>
            this.yearIndexValid(index) && <div key={index}>
              <div className={classes.calendarControlMonth}>
                <Button onClick={() => this.selectCalendarYear()} classes={{root:classes.calendarMonthTitle}}>
                  {(index * 18) + ' - ' + (index * 18 + 17)}
                </Button>
              </div>
              <div key={index} className={classnames(classes.calendarContainer, {[classes.calendarDialog]:dialog})}>
                {this.generateYearCalendar(index).map((years, index) =>
                  <div className={classes.years} key={'years-' + index}>
                    {years.map((currentYear, index) =>
                      <Button variant={year === currentYear? 'raised':'flat'} disabled={this.yearInvalid(currentYear)} onClick={() => this.selectCalendarYear(currentYear)} key={'year-' + index}>
                        <Typography className={classnames({[classes.invalidInput]:this.yearInvalid(currentYear)})} variant='body1'>{currentYear}</Typography>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          }
        />
      ] : []}
    </div>)
  }
}
export interface CalendarProps extends React.Props<{}>, StyledComponentProps {
  value: Date
  onChange: (value:Date) => void
  closeCalendar: () => void
  min?: Date
  max?: Date
  dialog?: boolean
}
export interface CalendarState {
  mode: 'year' | 'month'
  month: number
  year: number
  yearIndex: number
}

export default Calendar