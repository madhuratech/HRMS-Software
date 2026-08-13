import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalaryStructureScreen from '../screens/payroll/SalaryStructureScreen';
import SalaryComponentsScreen from '../screens/payroll/SalaryComponentsScreen';
import PayrollProcessingScreen from '../screens/payroll/PayrollProcessingScreen';
import GeneratePayslipsScreen from '../screens/payroll/GeneratePayslipsScreen';
import BonusIncentivesScreen from '../screens/payroll/BonusIncentivesScreen';
import ReimbursementsScreen from '../screens/payroll/ReimbursementsScreen';
import LoansAdvancesScreen from '../screens/payroll/LoansAdvancesScreen';
import TaxManagementScreen from '../screens/payroll/TaxManagementScreen';
import PayrollReportsScreen from '../screens/payroll/PayrollReportsScreen';

const Stack = createNativeStackNavigator();

export default function PayrollNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SalaryStructure" component={SalaryStructureScreen} />
      <Stack.Screen name="SalaryComponents" component={SalaryComponentsScreen} />
      <Stack.Screen name="PayrollProcessing" component={PayrollProcessingScreen} />
      <Stack.Screen name="GeneratePayslips" component={GeneratePayslipsScreen} />
      <Stack.Screen name="BonusIncentives" component={BonusIncentivesScreen} />
      <Stack.Screen name="Reimbursements" component={ReimbursementsScreen} />
      <Stack.Screen name="LoansAdvances" component={LoansAdvancesScreen} />
      <Stack.Screen name="TaxManagement" component={TaxManagementScreen} />
      <Stack.Screen name="PayrollReports" component={PayrollReportsScreen} />
    </Stack.Navigator>
  );
}
